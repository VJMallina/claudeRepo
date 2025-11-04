import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from './razorpay.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService,
  ) {}

  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from Swagger as this is for Razorpay only
  @ApiOperation({ summary: 'Handle Razorpay webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleRazorpayWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Received Razorpay webhook: ${body.event}`);

      // Verify webhook signature
      const isValid = this.razorpayService.verifyWebhookSignature(
        JSON.stringify(body),
        signature,
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature received');
        throw new BadRequestException('Invalid webhook signature');
      }

      // Process webhook event
      await this.processWebhookEvent(body);

      return { success: true };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process different webhook events
   */
  private async processWebhookEvent(body: any): Promise<void> {
    const event = body.event;
    const payload = body.payload;

    switch (event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;

      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;

      case 'payment.authorized':
        await this.handlePaymentAuthorized(payload);
        break;

      case 'order.paid':
        await this.handleOrderPaid(payload);
        break;

      case 'refund.created':
        await this.handleRefundCreated(payload);
        break;

      case 'refund.processed':
        await this.handleRefundProcessed(payload);
        break;

      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  /**
   * Handle payment.captured event
   */
  private async handlePaymentCaptured(payload: any): Promise<void> {
    try {
      const payment = payload.payment.entity;
      this.logger.log(`Processing payment.captured for payment: ${payment.id}`);

      // Find transaction by razorpay order ID
      const transaction = await this.prisma.transaction.findFirst({
        where: { razorpayOrderId: payment.order_id },
      });

      if (!transaction) {
        this.logger.warn(`Transaction not found for order: ${payment.order_id}`);
        return;
      }

      // Update transaction if not already updated
      if (transaction.status !== 'SUCCESS') {
        await this.prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'SUCCESS',
            razorpayPaymentId: payment.id,
            paymentMethod: payment.method?.toUpperCase(),
            vpa: payment.vpa,
            upiTransactionId: payment.acquirer_data?.upi_transaction_id,
            utr: payment.acquirer_data?.rrn,
          },
        });

        this.logger.log(`Transaction updated as SUCCESS: ${transaction.id}`);

        // Note: Auto-save is applied in verifyPayment endpoint
        // Webhook is just for backup/confirmation
      }
    } catch (error) {
      this.logger.error(`Failed to handle payment.captured: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle payment.failed event
   */
  private async handlePaymentFailed(payload: any): Promise<void> {
    try {
      const payment = payload.payment.entity;
      this.logger.log(`Processing payment.failed for payment: ${payment.id}`);

      const transaction = await this.prisma.transaction.findFirst({
        where: { razorpayOrderId: payment.order_id },
      });

      if (!transaction) {
        this.logger.warn(`Transaction not found for order: ${payment.order_id}`);
        return;
      }

      // Update transaction as failed
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          razorpayPaymentId: payment.id,
          failureReason: payment.error_description || 'Payment failed',
        },
      });

      this.logger.log(`Transaction marked as FAILED: ${transaction.id}`);
    } catch (error) {
      this.logger.error(`Failed to handle payment.failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle payment.authorized event
   */
  private async handlePaymentAuthorized(payload: any): Promise<void> {
    try {
      const payment = payload.payment.entity;
      this.logger.log(`Processing payment.authorized for payment: ${payment.id}`);

      // For auto-capture, this is just informational
      // Payment will be captured automatically by Razorpay
      // and payment.captured event will be triggered
    } catch (error) {
      this.logger.error(`Failed to handle payment.authorized: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle order.paid event
   */
  private async handleOrderPaid(payload: any): Promise<void> {
    try {
      const order = payload.order.entity;
      this.logger.log(`Processing order.paid for order: ${order.id}`);

      // Additional processing if needed
      // This event is triggered when order is fully paid
    } catch (error) {
      this.logger.error(`Failed to handle order.paid: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle refund.created event
   */
  private async handleRefundCreated(payload: any): Promise<void> {
    try {
      const refund = payload.refund.entity;
      this.logger.log(`Processing refund.created for refund: ${refund.id}`);

      // Find transaction by payment ID
      const transaction = await this.prisma.transaction.findFirst({
        where: { razorpayPaymentId: refund.payment_id },
      });

      if (!transaction) {
        this.logger.warn(`Transaction not found for payment: ${refund.payment_id}`);
        return;
      }

      // Update transaction metadata with refund info
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          metadata: {
            ...((transaction.metadata as any) || {}),
            refund: {
              id: refund.id,
              amount: refund.amount / 100, // Convert paise to rupees
              status: refund.status,
              createdAt: new Date(refund.created_at * 1000),
            },
          },
        },
      });

      this.logger.log(`Refund info added to transaction: ${transaction.id}`);
    } catch (error) {
      this.logger.error(`Failed to handle refund.created: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle refund.processed event
   */
  private async handleRefundProcessed(payload: any): Promise<void> {
    try {
      const refund = payload.refund.entity;
      this.logger.log(`Processing refund.processed for refund: ${refund.id}`);

      // Find transaction and update refund status
      const transaction = await this.prisma.transaction.findFirst({
        where: { razorpayPaymentId: refund.payment_id },
      });

      if (!transaction) {
        this.logger.warn(`Transaction not found for payment: ${refund.payment_id}`);
        return;
      }

      const metadata = (transaction.metadata as any) || {};
      if (metadata.refund) {
        metadata.refund.status = 'processed';
        metadata.refund.processedAt = new Date();
      }

      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { metadata },
      });

      // If auto-save was applied, reverse it
      if (transaction.autoSaveApplied && transaction.autoSaveAmount > 0) {
        await this.reverseAutoSave(transaction.userId, transaction.autoSaveAmount);
      }

      this.logger.log(`Refund processed for transaction: ${transaction.id}`);
    } catch (error) {
      this.logger.error(`Failed to handle refund.processed: ${error.message}`, error.stack);
    }
  }

  /**
   * Reverse auto-save when refund is processed
   */
  private async reverseAutoSave(userId: string, amount: number): Promise<void> {
    try {
      await this.prisma.savingsWallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
      });

      // Create withdrawal transaction
      await this.prisma.transaction.create({
        data: {
          userId,
          type: 'WITHDRAWAL',
          amount,
          status: 'SUCCESS',
          description: 'Auto-save reversed due to refund',
        },
      });

      this.logger.log(`Auto-save reversed for user: ${userId}, amount: ${amount}`);
    } catch (error) {
      this.logger.error(`Failed to reverse auto-save: ${error.message}`, error.stack);
    }
  }
}
