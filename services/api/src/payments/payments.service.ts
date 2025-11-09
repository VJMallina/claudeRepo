import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from './razorpay.service';
import {
  CreatePaymentDto,
  VerifyPaymentDto,
  GetTransactionsDto,
} from './dto/payment.dto';
import {
  PaymentOrderResponseDto,
  PaymentVerificationResponseDto,
  TransactionResponseDto,
  TransactionListResponseDto,
  PaymentStatsResponseDto,
} from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private razorpayService: RazorpayService,
  ) {}

  /**
   * Create a new payment order
   */
  async createPaymentOrder(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentOrderResponseDto> {
    try {
      this.logger.log(`Creating payment order for user: ${userId}`);

      // Check KYC level for payment amount
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // KYC Level 0: Payments up to ₹10,000 allowed
      // KYC Level 1+: Unlimited payments
      if (createPaymentDto.amount > 10000 && user.kycLevel < 1) {
        throw new BadRequestException({
          message: 'KYC Level 1 required for payments above ₹10,000',
          kycRequired: true,
          requiredLevel: 1,
          currentLevel: user.kycLevel,
          nextSteps: ['Verify PAN card to unlock higher payment limits'],
        });
      }

      // Get user's savings configuration
      const savingsConfig = await this.prisma.savingsConfig.findUnique({
        where: { userId },
      });

      // Calculate auto-save amount
      const autoSavePercentage = savingsConfig?.enabled ? savingsConfig.percentage : 0;
      const autoSaveAmount = Math.round((createPaymentDto.amount * autoSavePercentage) / 100);

      // Convert to paise (Razorpay uses smallest currency unit)
      const amountInPaise = RazorpayService.toPaise(createPaymentDto.amount);
      const autoSaveInPaise = RazorpayService.toPaise(autoSaveAmount);

      // Create Razorpay order
      const razorpayOrder = await this.razorpayService.createOrder({
        amount: amountInPaise,
        receipt: `txn_${Date.now()}_${userId.substring(0, 8)}`,
        notes: {
          userId,
          autoSaveAmount: autoSaveInPaise,
          autoSavePercentage,
          merchantName: createPaymentDto.merchantName,
          merchantUpiId: createPaymentDto.merchantUpiId,
        },
      });

      // Create transaction record in database
      const transaction = await this.prisma.transaction.create({
        data: {
          userId,
          type: 'PAYMENT',
          amount: createPaymentDto.amount,
          status: 'PENDING',
          razorpayOrderId: razorpayOrder.id,
          merchantName: createPaymentDto.merchantName,
          merchantUpiId: createPaymentDto.merchantUpiId,
          description: createPaymentDto.description,
          paymentMethod: createPaymentDto.paymentMethod,
          autoSaveAmount,
          autoSaveApplied: false,
        },
      });

      this.logger.log(`Payment order created: ${razorpayOrder.id}, Transaction: ${transaction.id}`);

      return {
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: razorpayOrder.currency,
        transactionId: transaction.id,
        autoSaveAmount: autoSaveInPaise,
        autoSavePercentage,
        razorpayKey: this.razorpayService.getRazorpayKeyId(),
      };
    } catch (error) {
      this.logger.error(`Failed to create payment order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verify payment and apply auto-save
   */
  async verifyPayment(
    userId: string,
    verifyPaymentDto: VerifyPaymentDto,
  ): Promise<PaymentVerificationResponseDto> {
    try {
      this.logger.log(`Verifying payment for user: ${userId}, order: ${verifyPaymentDto.razorpayOrderId}`);

      // Find transaction
      const transaction = await this.prisma.transaction.findUnique({
        where: { razorpayOrderId: verifyPaymentDto.razorpayOrderId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Verify user ownership
      if (transaction.userId !== userId) {
        throw new UnauthorizedException('Unauthorized to verify this payment');
      }

      // Verify Razorpay signature
      const isSignatureValid = this.razorpayService.verifyPaymentSignature(
        verifyPaymentDto.razorpayOrderId,
        verifyPaymentDto.razorpayPaymentId,
        verifyPaymentDto.razorpaySignature,
      );

      if (!isSignatureValid) {
        // Update transaction as failed
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            failureReason: 'Invalid payment signature',
          },
        });

        throw new BadRequestException('Payment verification failed');
      }

      // Fetch payment details from Razorpay
      const paymentDetails = await this.razorpayService.fetchPayment(
        verifyPaymentDto.razorpayPaymentId,
      );

      // Update transaction with payment details
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: verifyPaymentDto.razorpayPaymentId,
          razorpaySignature: verifyPaymentDto.razorpaySignature,
          paymentMethod: paymentDetails.method?.toUpperCase() as any,
          vpa: paymentDetails.vpa,
          upiTransactionId: paymentDetails.acquirer_data?.upi_transaction_id,
          utr: paymentDetails.acquirer_data?.rrn,
        },
      });

      // Apply auto-save if configured
      let savingsBalance = 0;
      if (transaction.autoSaveAmount > 0) {
        savingsBalance = await this.applyAutoSave(userId, transaction.id, transaction.autoSaveAmount);
      }

      this.logger.log(`Payment verified successfully: ${transaction.id}, Auto-saved: ${transaction.autoSaveAmount}`);

      return {
        success: true,
        message: 'Payment verified successfully',
        transactionId: transaction.id,
        amount: transaction.amount,
        autoSavedAmount: transaction.autoSaveAmount,
        savingsBalance,
        paymentMethod: updatedTransaction.paymentMethod,
        utr: updatedTransaction.utr,
      };
    } catch (error) {
      this.logger.error(`Failed to verify payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Apply auto-save to savings wallet
   */
  private async applyAutoSave(
    userId: string,
    transactionId: string,
    autoSaveAmount: number,
  ): Promise<number> {
    try {
      this.logger.log(`Applying auto-save for user: ${userId}, amount: ${autoSaveAmount}`);

      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (prisma) => {
        // Get or create savings wallet
        let savingsWallet = await prisma.savingsWallet.findUnique({
          where: { userId },
        });

        if (!savingsWallet) {
          savingsWallet = await prisma.savingsWallet.create({
            data: {
              userId,
              balance: 0,
              totalSaved: 0,
              totalWithdrawn: 0,
              totalInvested: 0,
            },
          });
        }

        // Update savings wallet
        const updatedWallet = await prisma.savingsWallet.update({
          where: { userId },
          data: {
            balance: { increment: autoSaveAmount },
            totalSaved: { increment: autoSaveAmount },
          },
        });

        // Mark transaction as auto-save applied
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { autoSaveApplied: true },
        });

        // Create a savings transaction record
        await prisma.transaction.create({
          data: {
            userId,
            type: 'DEPOSIT',
            amount: autoSaveAmount,
            status: 'SUCCESS',
            description: `Auto-save from payment transaction`,
            metadata: {
              sourceTransactionId: transactionId,
              autoSave: true,
            },
          },
        });

        return updatedWallet.balance;
      });

      this.logger.log(`Auto-save applied successfully. New balance: ${result}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to apply auto-save: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to apply auto-save');
    }
  }

  /**
   * Get user transactions
   */
  async getTransactions(
    userId: string,
    query: GetTransactionsDto,
  ): Promise<TransactionListResponseDto> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = { userId };

      if (query.status) {
        where.status = query.status;
      }

      if (query.type) {
        where.type = query.type;
      }

      const [transactions, total] = await Promise.all([
        this.prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.transaction.count({ where }),
      ]);

      const transactionDtos: TransactionResponseDto[] = transactions.map((txn) => ({
        id: txn.id,
        type: txn.type,
        amount: txn.amount,
        status: txn.status,
        merchantName: txn.merchantName,
        merchantUpiId: txn.merchantUpiId,
        utr: txn.utr,
        autoSaveAmount: txn.autoSaveAmount,
        autoSaveApplied: txn.autoSaveApplied,
        paymentMethod: txn.paymentMethod,
        vpa: txn.vpa,
        description: txn.description,
        createdAt: txn.createdAt,
        updatedAt: txn.updatedAt,
      }));

      return {
        transactions: transactionDtos,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch transactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get single transaction details
   */
  async getTransaction(userId: string, transactionId: string): Promise<TransactionResponseDto> {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (transaction.userId !== userId) {
        throw new UnauthorizedException('Unauthorized to access this transaction');
      }

      return {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        merchantName: transaction.merchantName,
        merchantUpiId: transaction.merchantUpiId,
        utr: transaction.utr,
        autoSaveAmount: transaction.autoSaveAmount,
        autoSaveApplied: transaction.autoSaveApplied,
        paymentMethod: transaction.paymentMethod,
        vpa: transaction.vpa,
        description: transaction.description,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(userId: string): Promise<PaymentStatsResponseDto> {
    try {
      const stats = await this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'PAYMENT',
        },
        _count: true,
        _sum: {
          amount: true,
          autoSaveAmount: true,
        },
      });

      const successCount = await this.prisma.transaction.count({
        where: { userId, type: 'PAYMENT', status: 'SUCCESS' },
      });

      const failedCount = await this.prisma.transaction.count({
        where: { userId, type: 'PAYMENT', status: 'FAILED' },
      });

      const savingsConfig = await this.prisma.savingsConfig.findUnique({
        where: { userId },
      });

      return {
        totalPayments: stats._count || 0,
        totalAmount: stats._sum.amount || 0,
        totalAutoSaved: stats._sum.autoSaveAmount || 0,
        successfulPayments: successCount,
        failedPayments: failedCount,
        avgSavingsPercentage: savingsConfig?.percentage || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch payment stats: ${error.message}`, error.stack);
      throw error;
    }
  }
}
