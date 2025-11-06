import { Platform } from 'react-native';
import apiService from './api.service';

/**
 * Razorpay Payment Service
 *
 * Handles Razorpay payment gateway integration
 * Features:
 * - Payment order creation
 * - Payment verification
 * - UPI payments
 * - Card payments
 * - Net banking
 * - Wallet payments
 * - Auto-save calculation
 * - KYC-based payment limits
 *
 * Note: Uses Razorpay React Native SDK
 * Installation: npm install react-native-razorpay
 */

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export interface PaymentOrder {
  orderId: string;
  amount: number; // in paise
  currency: string;
  transactionId: string;
  autoSaveAmount: number;
  autoSavePercentage: number;
  razorpayKey: string;
}

export interface PaymentResult {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  transactionId: string;
  amount: number;
  autoSavedAmount: number;
  savingsBalance: number;
}

class RazorpayService {
  private razorpay: any = null;

  /**
   * Initialize Razorpay
   */
  async initialize(): Promise<void> {
    try {
      // Dynamically import Razorpay SDK
      // This allows app to work even if SDK is not installed yet
      const RazorpayCheckout = require('react-native-razorpay').default;
      this.razorpay = RazorpayCheckout;
      console.log('✅ Razorpay SDK initialized');
    } catch (error) {
      console.warn('⚠️  Razorpay SDK not installed. Install with: npm install react-native-razorpay');
      console.warn('Payments will use mock mode for testing');
    }
  }

  /**
   * Create payment order from backend
   */
  async createPaymentOrder(data: {
    amount: number; // in rupees
    merchantName: string;
    merchantUpiId?: string;
    description?: string;
    paymentMethod?: string;
  }): Promise<PaymentOrder> {
    try {
      const response = await apiService.post<PaymentOrder>('/payments/create-order', data);
      return response;
    } catch (error: any) {
      // Handle KYC requirement error
      if (error.response?.data?.kycRequired) {
        throw {
          type: 'KYC_REQUIRED',
          message: error.response.data.message,
          requiredLevel: error.response.data.requiredLevel,
          currentLevel: error.response.data.currentLevel,
          nextSteps: error.response.data.nextSteps,
        };
      }
      throw error;
    }
  }

  /**
   * Open Razorpay payment gateway
   */
  async openPaymentGateway(order: PaymentOrder, userInfo?: {
    name?: string;
    email?: string;
    contact?: string;
  }): Promise<PaymentResult> {
    if (!this.razorpay) {
      // Mock mode for testing
      return this.mockPayment(order);
    }

    const options: RazorpayOptions = {
      key: order.razorpayKey,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'SaveInvest',
      description: 'Payment transaction',
      image: 'https://your-logo-url.com/logo.png',
      order_id: order.orderId,
      prefill: userInfo,
      notes: {
        transactionId: order.transactionId,
        autoSavePercentage: order.autoSavePercentage.toString(),
      },
      theme: {
        color: '#016B61', // SaveInvest brand color
      },
    };

    return new Promise((resolve, reject) => {
      this.razorpay.open(options)
        .then((data: PaymentResult) => {
          resolve(data);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  /**
   * Mock payment for testing (when SDK not installed)
   */
  private async mockPayment(order: PaymentOrder): Promise<PaymentResult> {
    console.log('🧪 [MOCK] Processing payment:', order);

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock payment result
    return {
      razorpayPaymentId: `pay_mock_${Date.now()}`,
      razorpayOrderId: order.orderId,
      razorpaySignature: `sig_mock_${Date.now()}`,
    };
  }

  /**
   * Verify payment with backend
   */
  async verifyPayment(paymentResult: PaymentResult): Promise<PaymentVerificationResult> {
    try {
      const response = await apiService.post<PaymentVerificationResult>(
        '/payments/verify',
        paymentResult
      );
      return response;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  /**
   * Complete payment flow (create order + pay + verify)
   */
  async processPayment(data: {
    amount: number;
    merchantName: string;
    merchantUpiId?: string;
    description?: string;
    userInfo?: {
      name?: string;
      email?: string;
      contact?: string;
    };
  }): Promise<PaymentVerificationResult> {
    try {
      // Step 1: Create order
      const order = await this.createPaymentOrder({
        amount: data.amount,
        merchantName: data.merchantName,
        merchantUpiId: data.merchantUpiId,
        description: data.description,
      });

      // Step 2: Open payment gateway
      const paymentResult = await this.openPaymentGateway(order, data.userInfo);

      // Step 3: Verify payment
      const verification = await this.verifyPayment(paymentResult);

      return verification;
    } catch (error) {
      console.error('Payment process failed:', error);
      throw error;
    }
  }

  /**
   * Check payment limits based on KYC level
   */
  async checkPaymentLimit(amount: number): Promise<{
    allowed: boolean;
    limit: number;
    kycLevel: number;
    requiredLevel?: number;
    message?: string;
  }> {
    try {
      const response = await apiService.post('/payments/check-limit', { amount });
      return response;
    } catch (error) {
      console.error('Error checking payment limit:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    totalAutoSaved: number;
    successfulPayments: number;
    failedPayments: number;
    avgSavingsPercentage: number;
  }> {
    try {
      const response = await apiService.get('/payments/stats');
      return response;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  /**
   * Convert rupees to paise
   */
  toPaise(rupees: number): number {
    return Math.round(rupees * 100);
  }

  /**
   * Convert paise to rupees
   */
  toRupees(paise: number): number {
    return paise / 100;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, includeCurrency: boolean = true): string {
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return includeCurrency ? `₹${formatted}` : formatted;
  }

  /**
   * Test payment (development only)
   */
  async testPayment(): Promise<void> {
    try {
      const result = await this.processPayment({
        amount: 100, // ₹100
        merchantName: 'Test Merchant',
        description: 'Test payment',
        userInfo: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9876543210',
        },
      });

      console.log('✅ Test payment successful:', result);
    } catch (error) {
      console.error('❌ Test payment failed:', error);
    }
  }
}

export default new RazorpayService();
