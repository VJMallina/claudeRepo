import RazorpayCheckout from 'react-native-razorpay';
import RazorpayService, {
  PaymentOrder,
  PaymentVerificationResult,
} from '../razorpay.service';
import apiService from '../api.service';

// Mock dependencies
jest.mock('react-native-razorpay', () => ({
  open: jest.fn(),
}));
jest.mock('../api.service');

describe('RazorpayService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentOrder', () => {
    it('should create payment order with valid data', async () => {
      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000, // ₹100 in paise
        currency: 'INR',
        merchantName: 'Test Merchant',
        merchantUpiId: 'merchant@upi',
        description: 'Test payment',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      const result = await RazorpayService.createPaymentOrder({
        amount: 100,
        merchantName: 'Test Merchant',
        merchantUpiId: 'merchant@upi',
        description: 'Test payment',
      });

      expect(result).toEqual(mockOrder);
      expect(apiService.post).toHaveBeenCalledWith('/payments/create-order', {
        amount: 10000, // Converted to paise
        merchantName: 'Test Merchant',
        merchantUpiId: 'merchant@upi',
        description: 'Test payment',
      });
    });

    it('should create order without optional fields', async () => {
      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 5000,
        currency: 'INR',
        merchantName: 'Test Merchant',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      const result = await RazorpayService.createPaymentOrder({
        amount: 50,
        merchantName: 'Test Merchant',
      });

      expect(result).toEqual(mockOrder);
      expect(apiService.post).toHaveBeenCalledWith('/payments/create-order', {
        amount: 5000,
        merchantName: 'Test Merchant',
      });
    });

    it('should handle API errors', async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        RazorpayService.createPaymentOrder({
          amount: 100,
          merchantName: 'Test Merchant',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('openPaymentGateway', () => {
    it('should open Razorpay checkout with correct options', async () => {
      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        merchantName: 'Test Merchant',
      };

      const mockUserInfo = {
        name: 'John Doe',
        email: 'john@example.com',
        contact: '9876543210',
      };

      const mockPaymentData = {
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'signature_123',
      };

      (RazorpayCheckout.open as jest.Mock).mockResolvedValue(mockPaymentData);

      const result = await RazorpayService.openPaymentGateway(mockOrder, mockUserInfo);

      expect(result).toEqual(mockPaymentData);
      expect(RazorpayCheckout.open).toHaveBeenCalledWith({
        key: expect.any(String),
        amount: 10000,
        currency: 'INR',
        name: 'Test Merchant',
        order_id: 'order_123',
        prefill: mockUserInfo,
        theme: { color: '#6366F1' },
      });
    });

    it('should use mock mode when Razorpay SDK is not available', async () => {
      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        merchantName: 'Test Merchant',
      };

      (RazorpayCheckout.open as jest.Mock).mockImplementation(() => {
        throw new Error('RazorpayCheckout is not available');
      });

      const result = await RazorpayService.openPaymentGateway(mockOrder);

      // Mock mode should return simulated payment data
      expect(result).toHaveProperty('razorpay_payment_id');
      expect(result).toHaveProperty('razorpay_order_id', 'order_123');
      expect(result).toHaveProperty('razorpay_signature');
      expect(result.razorpay_payment_id).toContain('mock_pay_');
    });

    it('should handle payment cancellation', async () => {
      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        merchantName: 'Test Merchant',
      };

      (RazorpayCheckout.open as jest.Mock).mockRejectedValue({
        code: 2,
        description: 'Payment cancelled by user',
      });

      await expect(RazorpayService.openPaymentGateway(mockOrder)).rejects.toMatchObject({
        code: 2,
        description: 'Payment cancelled by user',
      });
    });

    it('should handle payment failure', async () => {
      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        merchantName: 'Test Merchant',
      };

      (RazorpayCheckout.open as jest.Mock).mockRejectedValue({
        code: 0,
        description: 'Payment failed',
      });

      await expect(RazorpayService.openPaymentGateway(mockOrder)).rejects.toMatchObject({
        code: 0,
        description: 'Payment failed',
      });
    });
  });

  describe('verifyPayment', () => {
    it('should verify successful payment', async () => {
      const mockPaymentData = {
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'signature_123',
      };

      const mockVerification: PaymentVerificationResult = {
        verified: true,
        paymentId: 'pay_123',
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        status: 'SUCCESS',
        message: 'Payment successful',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockVerification);

      const result = await RazorpayService.verifyPayment(mockPaymentData);

      expect(result).toEqual(mockVerification);
      expect(apiService.post).toHaveBeenCalledWith('/payments/verify', mockPaymentData);
    });

    it('should handle verification failure', async () => {
      const mockPaymentData = {
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'invalid_signature',
      };

      const mockVerification: PaymentVerificationResult = {
        verified: false,
        paymentId: 'pay_123',
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        status: 'FAILED',
        message: 'Signature verification failed',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockVerification);

      const result = await RazorpayService.verifyPayment(mockPaymentData);

      expect(result.verified).toBe(false);
      expect(result.status).toBe('FAILED');
    });

    it('should handle verification API errors', async () => {
      const mockPaymentData = {
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'signature_123',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(RazorpayService.verifyPayment(mockPaymentData)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('processPayment - Complete Flow', () => {
    it('should complete full payment flow successfully', async () => {
      const paymentData = {
        amount: 100,
        merchantName: 'Test Merchant',
        merchantUpiId: 'merchant@upi',
        description: 'Test payment',
        userInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          contact: '9876543210',
        },
      };

      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        merchantName: 'Test Merchant',
        merchantUpiId: 'merchant@upi',
        description: 'Test payment',
      };

      const mockPaymentResponse = {
        razorpay_payment_id: 'pay_123',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'signature_123',
      };

      const mockVerification: PaymentVerificationResult = {
        verified: true,
        paymentId: 'pay_123',
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        status: 'SUCCESS',
        message: 'Payment successful',
      };

      // Mock the entire flow
      (apiService.post as jest.Mock)
        .mockResolvedValueOnce(mockOrder) // createOrder
        .mockResolvedValueOnce(mockVerification); // verifyPayment

      (RazorpayCheckout.open as jest.Mock).mockResolvedValue(mockPaymentResponse);

      const result = await RazorpayService.processPayment(paymentData);

      expect(result.verified).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.paymentId).toBe('pay_123');

      // Verify all steps were called
      expect(apiService.post).toHaveBeenCalledTimes(2);
      expect(RazorpayCheckout.open).toHaveBeenCalledTimes(1);
    });

    it('should handle payment flow failure at order creation', async () => {
      const paymentData = {
        amount: 100,
        merchantName: 'Test Merchant',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Order creation failed'));

      await expect(RazorpayService.processPayment(paymentData)).rejects.toThrow(
        'Order creation failed'
      );
    });

    it('should handle payment flow failure at checkout', async () => {
      const paymentData = {
        amount: 100,
        merchantName: 'Test Merchant',
      };

      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        merchantName: 'Test Merchant',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);
      (RazorpayCheckout.open as jest.Mock).mockRejectedValue({
        code: 2,
        description: 'Payment cancelled',
      });

      await expect(RazorpayService.processPayment(paymentData)).rejects.toMatchObject({
        code: 2,
      });
    });
  });

  describe('checkPaymentLimits', () => {
    it('should allow payment within KYC limits', async () => {
      const mockLimits = {
        allowed: true,
        kycLevel: 'FULL',
        currentLimit: 100000,
        usedAmount: 50000,
        remainingAmount: 50000,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockLimits);

      const result = await RazorpayService.checkPaymentLimits(10000);

      expect(result.allowed).toBe(true);
      expect(result.remainingAmount).toBe(50000);
      expect(apiService.get).toHaveBeenCalledWith('/payments/check-limits?amount=10000');
    });

    it('should reject payment exceeding KYC limits', async () => {
      const mockLimits = {
        allowed: false,
        kycLevel: 'BASIC',
        currentLimit: 50000,
        usedAmount: 45000,
        remainingAmount: 5000,
        message: 'Amount exceeds remaining limit',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockLimits);

      const result = await RazorpayService.checkPaymentLimits(10000);

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('exceeds');
    });
  });

  describe('calculateAutoSave', () => {
    it('should calculate 10% auto-save correctly', () => {
      expect(RazorpayService.calculateAutoSave(1000, 10)).toBe(100);
      expect(RazorpayService.calculateAutoSave(5500, 10)).toBe(550);
      expect(RazorpayService.calculateAutoSave(250, 10)).toBe(25);
    });

    it('should calculate 5% auto-save correctly', () => {
      expect(RazorpayService.calculateAutoSave(1000, 5)).toBe(50);
      expect(RazorpayService.calculateAutoSave(2000, 5)).toBe(100);
    });

    it('should handle zero amount', () => {
      expect(RazorpayService.calculateAutoSave(0, 10)).toBe(0);
    });

    it('should handle decimal amounts', () => {
      expect(RazorpayService.calculateAutoSave(1234.56, 10)).toBe(123.46);
    });
  });

  describe('formatAmount', () => {
    it('should format rupees to paise', () => {
      expect(RazorpayService.formatAmount(100)).toBe(10000);
      expect(RazorpayService.formatAmount(1)).toBe(100);
      expect(RazorpayService.formatAmount(50.5)).toBe(5050);
    });

    it('should handle zero', () => {
      expect(RazorpayService.formatAmount(0)).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', async () => {
      const largeAmount = 1000000; // ₹10 lakhs

      const mockOrder: PaymentOrder = {
        orderId: 'order_large',
        amount: largeAmount * 100,
        currency: 'INR',
        merchantName: 'Test Merchant',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      const result = await RazorpayService.createPaymentOrder({
        amount: largeAmount,
        merchantName: 'Test Merchant',
      });

      expect(result.amount).toBe(largeAmount * 100);
    });

    it('should handle special characters in merchant name', async () => {
      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        merchantName: 'Merchant & Co.',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      const result = await RazorpayService.createPaymentOrder({
        amount: 100,
        merchantName: 'Merchant & Co.',
      });

      expect(result.merchantName).toBe('Merchant & Co.');
    });

    it('should handle concurrent payment requests', async () => {
      const mockOrder: PaymentOrder = {
        orderId: 'order_123',
        amount: 10000,
        currency: 'INR',
        merchantName: 'Test Merchant',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOrder);

      const promises = [
        RazorpayService.createPaymentOrder({ amount: 100, merchantName: 'Merchant 1' }),
        RazorpayService.createPaymentOrder({ amount: 200, merchantName: 'Merchant 2' }),
        RazorpayService.createPaymentOrder({ amount: 300, merchantName: 'Merchant 3' }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.post).toHaveBeenCalledTimes(3);
    });
  });
});
