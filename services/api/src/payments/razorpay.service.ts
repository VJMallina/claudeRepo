import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

export interface RazorpayOrderOptions {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  captured: boolean;
  email?: string;
  contact?: string;
  vpa?: string;
  notes: Record<string, any>;
  created_at: number;
  acquirer_data?: {
    upi_transaction_id?: string;
    rrn?: string;
  };
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private razorpayInstance: any;
  private readonly razorpayKeyId: string;
  private readonly razorpayKeySecret: string;

  constructor(private configService: ConfigService) {
    this.razorpayKeyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    this.razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!this.razorpayKeyId || !this.razorpayKeySecret) {
      this.logger.warn('Razorpay credentials not configured. Payment features will be disabled.');
    } else {
      this.razorpayInstance = new Razorpay({
        key_id: this.razorpayKeyId,
        key_secret: this.razorpayKeySecret,
      });
      this.logger.log('Razorpay service initialized');
    }
  }

  /**
   * Create a new Razorpay order
   */
  async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
    try {
      this.ensureInitialized();

      const orderOptions = {
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt || `rcpt_${Date.now()}`,
        notes: options.notes || {},
      };

      this.logger.log(`Creating Razorpay order: ${JSON.stringify(orderOptions)}`);

      const order = await this.razorpayInstance.orders.create(orderOptions);

      this.logger.log(`Razorpay order created: ${order.id}`);

      return order;
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  /**
   * Fetch order details
   */
  async fetchOrder(orderId: string): Promise<RazorpayOrder> {
    try {
      this.ensureInitialized();

      this.logger.log(`Fetching Razorpay order: ${orderId}`);

      const order = await this.razorpayInstance.orders.fetch(orderId);

      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch Razorpay order: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch order details');
    }
  }

  /**
   * Fetch payment details
   */
  async fetchPayment(paymentId: string): Promise<RazorpayPayment> {
    try {
      this.ensureInitialized();

      this.logger.log(`Fetching Razorpay payment: ${paymentId}`);

      const payment = await this.razorpayInstance.payments.fetch(paymentId);

      return payment;
    } catch (error) {
      this.logger.error(`Failed to fetch Razorpay payment: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch payment details');
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    try {
      this.ensureInitialized();

      const generatedSignature = crypto
        .createHmac('sha256', this.razorpayKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = generatedSignature === signature;

      if (isValid) {
        this.logger.log(`Payment signature verified successfully for order: ${orderId}`);
      } else {
        this.logger.warn(`Payment signature verification failed for order: ${orderId}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Failed to verify payment signature: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');

      if (!webhookSecret) {
        this.logger.warn('Razorpay webhook secret not configured');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === signature;

      if (isValid) {
        this.logger.log('Webhook signature verified successfully');
      } else {
        this.logger.warn('Webhook signature verification failed');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Failed to verify webhook signature: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Capture payment (for authorized payments)
   */
  async capturePayment(paymentId: string, amount: number): Promise<RazorpayPayment> {
    try {
      this.ensureInitialized();

      this.logger.log(`Capturing payment: ${paymentId}, amount: ${amount}`);

      const payment = await this.razorpayInstance.payments.capture(
        paymentId,
        amount,
        'INR',
      );

      this.logger.log(`Payment captured successfully: ${paymentId}`);

      return payment;
    } catch (error) {
      this.logger.error(`Failed to capture payment: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to capture payment');
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      this.ensureInitialized();

      this.logger.log(`Creating refund for payment: ${paymentId}, amount: ${amount || 'full'}`);

      const refundOptions = amount ? { amount } : {};

      const refund = await this.razorpayInstance.payments.refund(
        paymentId,
        refundOptions,
      );

      this.logger.log(`Refund created successfully: ${refund.id}`);

      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to process refund');
    }
  }

  /**
   * Get Razorpay key ID for frontend
   */
  getRazorpayKeyId(): string {
    return this.razorpayKeyId;
  }

  /**
   * Ensure Razorpay is initialized
   */
  private ensureInitialized(): void {
    if (!this.razorpayInstance) {
      throw new BadRequestException('Payment gateway not configured');
    }
  }

  /**
   * Convert amount to paise (smallest currency unit)
   */
  static toPaise(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert paise to rupees
   */
  static toRupees(paise: number): number {
    return paise / 100;
  }
}
