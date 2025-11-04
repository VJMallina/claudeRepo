import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateSavingsConfigDto,
  WithdrawSavingsDto,
  DepositSavingsDto,
  GetSavingsTransactionsDto,
} from './dto/savings-config.dto';
import {
  SavingsConfigResponseDto,
  SavingsWalletResponseDto,
  SavingsStatsResponseDto,
} from './dto/savings-response.dto';
import { TransactionListResponseDto } from '../payments/dto/payment-response.dto';

@Injectable()
export class SavingsService {
  private readonly logger = new Logger(SavingsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get user's savings configuration
   */
  async getSavingsConfig(userId: string): Promise<SavingsConfigResponseDto> {
    try {
      let config = await this.prisma.savingsConfig.findUnique({
        where: { userId },
      });

      // Create default config if doesn't exist
      if (!config) {
        config = await this.prisma.savingsConfig.create({
          data: {
            userId,
            enabled: true,
            percentage: 10.0,
            minTransactionAmount: 10.0,
            frequency: 'EVERY_TRANSACTION',
          },
        });
        this.logger.log(`Created default savings config for user: ${userId}`);
      }

      return {
        id: config.id,
        percentage: config.percentage,
        enabled: config.enabled,
        minTransactionAmount: config.minTransactionAmount,
        maxSavingsPerTransaction: config.maxSavingsPerTransaction,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get savings config: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update user's savings configuration
   */
  async updateSavingsConfig(
    userId: string,
    updateDto: UpdateSavingsConfigDto,
  ): Promise<SavingsConfigResponseDto> {
    try {
      this.logger.log(`Updating savings config for user: ${userId}`);

      // Get or create config
      let config = await this.prisma.savingsConfig.findUnique({
        where: { userId },
      });

      if (!config) {
        config = await this.prisma.savingsConfig.create({
          data: {
            userId,
            ...updateDto,
            frequency: 'EVERY_TRANSACTION',
          },
        });
      } else {
        config = await this.prisma.savingsConfig.update({
          where: { userId },
          data: updateDto,
        });
      }

      this.logger.log(`Savings config updated: ${config.id}, Percentage: ${config.percentage}%`);

      return {
        id: config.id,
        percentage: config.percentage,
        enabled: config.enabled,
        minTransactionAmount: config.minTransactionAmount,
        maxSavingsPerTransaction: config.maxSavingsPerTransaction,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to update savings config: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user's savings wallet
   */
  async getSavingsWallet(userId: string): Promise<SavingsWalletResponseDto> {
    try {
      let wallet = await this.prisma.savingsWallet.findUnique({
        where: { userId },
      });

      // Create wallet if doesn't exist
      if (!wallet) {
        wallet = await this.prisma.savingsWallet.create({
          data: {
            userId,
            balance: 0,
            totalSaved: 0,
            totalWithdrawn: 0,
            totalInvested: 0,
          },
        });
        this.logger.log(`Created savings wallet for user: ${userId}`);
      }

      return {
        id: wallet.id,
        balance: wallet.balance,
        totalSaved: wallet.totalSaved,
        totalWithdrawn: wallet.totalWithdrawn,
        totalInvested: wallet.totalInvested,
        lastUpdated: wallet.lastUpdated,
      };
    } catch (error) {
      this.logger.error(`Failed to get savings wallet: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Withdraw from savings wallet
   */
  async withdrawSavings(
    userId: string,
    withdrawDto: WithdrawSavingsDto,
  ): Promise<{ success: boolean; message: string; newBalance: number }> {
    try {
      this.logger.log(`Processing withdrawal for user: ${userId}, amount: ${withdrawDto.amount}`);

      return await this.prisma.$transaction(async (prisma) => {
        // Get wallet
        const wallet = await prisma.savingsWallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundException('Savings wallet not found');
        }

        // Check sufficient balance
        if (wallet.balance < withdrawDto.amount) {
          throw new BadRequestException('Insufficient balance in savings wallet');
        }

        // Update wallet
        const updatedWallet = await prisma.savingsWallet.update({
          where: { userId },
          data: {
            balance: { decrement: withdrawDto.amount },
            totalWithdrawn: { increment: withdrawDto.amount },
          },
        });

        // Create withdrawal transaction
        await prisma.transaction.create({
          data: {
            userId,
            type: 'WITHDRAWAL',
            amount: withdrawDto.amount,
            status: 'SUCCESS',
            description: withdrawDto.reason || 'Withdrawal from savings',
          },
        });

        this.logger.log(`Withdrawal successful: ${withdrawDto.amount}, New balance: ${updatedWallet.balance}`);

        return {
          success: true,
          message: 'Withdrawal successful',
          newBalance: updatedWallet.balance,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to process withdrawal: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Manual deposit to savings wallet
   */
  async depositSavings(
    userId: string,
    depositDto: DepositSavingsDto,
  ): Promise<{ success: boolean; message: string; newBalance: number }> {
    try {
      this.logger.log(`Processing deposit for user: ${userId}, amount: ${depositDto.amount}`);

      return await this.prisma.$transaction(async (prisma) => {
        // Get or create wallet
        let wallet = await prisma.savingsWallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          wallet = await prisma.savingsWallet.create({
            data: {
              userId,
              balance: 0,
              totalSaved: 0,
              totalWithdrawn: 0,
              totalInvested: 0,
            },
          });
        }

        // Update wallet
        const updatedWallet = await prisma.savingsWallet.update({
          where: { userId },
          data: {
            balance: { increment: depositDto.amount },
            totalSaved: { increment: depositDto.amount },
          },
        });

        // Create deposit transaction
        await prisma.transaction.create({
          data: {
            userId,
            type: 'DEPOSIT',
            amount: depositDto.amount,
            status: 'SUCCESS',
            description: depositDto.description || 'Manual deposit to savings',
          },
        });

        this.logger.log(`Deposit successful: ${depositDto.amount}, New balance: ${updatedWallet.balance}`);

        return {
          success: true,
          message: 'Deposit successful',
          newBalance: updatedWallet.balance,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to process deposit: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get savings transactions
   */
  async getSavingsTransactions(
    userId: string,
    query: GetSavingsTransactionsDto,
  ): Promise<TransactionListResponseDto> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {
        userId,
        type: { in: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'REDEMPTION'] },
      };

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

      return {
        transactions: transactions.map((txn) => ({
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
        })),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch savings transactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get savings statistics
   */
  async getSavingsStats(userId: string): Promise<SavingsStatsResponseDto> {
    try {
      const [wallet, config, activeRulesCount, rules] = await Promise.all([
        this.getSavingsWallet(userId),
        this.getSavingsConfig(userId),
        this.prisma.autoInvestRule.count({
          where: { userId, enabled: true },
        }),
        this.prisma.autoInvestRule.findMany({
          where: { userId, enabled: true },
          include: { product: { select: { name: true } } },
        }),
      ]);

      // Calculate investment allocation
      const investmentAllocation: Record<string, number> = {};
      const totalPercentage = rules.reduce(
        (sum, rule) => sum + (rule.investmentPercentage || 0),
        0,
      );

      rules.forEach((rule) => {
        if (rule.investmentPercentage && rule.product) {
          const normalizedPercentage =
            totalPercentage > 0
              ? Math.round((rule.investmentPercentage / totalPercentage) * 100)
              : 0;
          investmentAllocation[rule.product.name] = normalizedPercentage;
        }
      });

      return {
        currentBalance: wallet.balance,
        totalSaved: wallet.totalSaved,
        totalWithdrawn: wallet.totalWithdrawn,
        totalInvested: wallet.totalInvested,
        savingsPercentage: config.percentage,
        activeInvestmentRules: activeRulesCount,
        investmentAllocation,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch savings stats: ${error.message}`, error.stack);
      throw error;
    }
  }
}
