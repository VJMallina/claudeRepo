import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RazorpayService } from './razorpay.service';
import * as crypto from 'crypto';

describe('RazorpayService', () => {
  let service: RazorpayService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        RAZORPAY_KEY_ID: 'test_key_id',
        RAZORPAY_KEY_SECRET: 'test_key_secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RazorpayService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RazorpayService>(RazorpayService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with Razorpay credentials', () => {
      expect(configService.get).toHaveBeenCalledWith('RAZORPAY_KEY_ID');
      expect(configService.get).toHaveBeenCalledWith('RAZORPAY_KEY_SECRET');
    });
  });

  describe('toPaise', () => {
    it('should convert rupees to paise correctly', () => {
      expect(RazorpayService.toPaise(100)).toBe(10000);
      expect(RazorpayService.toPaise(1.50)).toBe(150);
      expect(RazorpayService.toPaise(0.50)).toBe(50);
      expect(RazorpayService.toPaise(999.99)).toBe(99999);
    });

    it('should handle zero', () => {
      expect(RazorpayService.toPaise(0)).toBe(0);
    });
  });

  describe('toRupees', () => {
    it('should convert paise to rupees correctly', () => {
      expect(RazorpayService.toRupees(10000)).toBe(100);
      expect(RazorpayService.toRupees(150)).toBe(1.50);
      expect(RazorpayService.toRupees(50)).toBe(0.50);
      expect(RazorpayService.toRupees(99999)).toBe(999.99);
    });

    it('should handle zero', () => {
      expect(RazorpayService.toRupees(0)).toBe(0);
    });
  });

  describe('verifyPaymentSignature', () => {
    const orderId = 'order_123';
    const paymentId = 'pay_123';
    const secret = 'test_key_secret';

    it('should verify valid signature', () => {
      // Generate valid signature
      const text = `${orderId}|${paymentId}`;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(text)
        .digest('hex');

      const result = service.verifyPaymentSignature(
        orderId,
        paymentId,
        signature,
      );

      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      const invalidSignature = 'invalid_signature_123';

      const result = service.verifyPaymentSignature(
        orderId,
        paymentId,
        invalidSignature,
      );

      expect(result).toBe(false);
    });

    it('should reject signature with tampered orderId', () => {
      const text = `${orderId}|${paymentId}`;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(text)
        .digest('hex');

      const result = service.verifyPaymentSignature(
        'tampered_order_id',
        paymentId,
        signature,
      );

      expect(result).toBe(false);
    });

    it('should reject signature with tampered paymentId', () => {
      const text = `${orderId}|${paymentId}`;
      const signature = crypto
        .createHmac('sha256', secret)
        .update(text)
        .digest('hex');

      const result = service.verifyPaymentSignature(
        orderId,
        'tampered_payment_id',
        signature,
      );

      expect(result).toBe(false);
    });
  });

  describe('verifyWebhookSignature', () => {
    const secret = 'webhook_secret';
    const payload = { event: 'payment.captured', payload: { payment: {} } };

    it('should verify valid webhook signature', () => {
      const body = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const result = service.verifyWebhookSignature(body, signature, secret);

      expect(result).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const body = JSON.stringify(payload);
      const invalidSignature = 'invalid_webhook_signature';

      const result = service.verifyWebhookSignature(
        body,
        invalidSignature,
        secret,
      );

      expect(result).toBe(false);
    });

    it('should reject signature with tampered payload', () => {
      const body = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const tamperedBody = JSON.stringify({ ...payload, tampered: true });

      const result = service.verifyWebhookSignature(
        tamperedBody,
        signature,
        secret,
      );

      expect(result).toBe(false);
    });
  });

  describe('currency conversions', () => {
    it('should handle round-trip conversion', () => {
      const rupees = 123.45;
      const paise = RazorpayService.toPaise(rupees);
      const backToRupees = RazorpayService.toRupees(paise);

      expect(backToRupees).toBe(rupees);
    });

    it('should handle large amounts', () => {
      const largeAmount = 999999.99;
      const paise = RazorpayService.toPaise(largeAmount);
      expect(paise).toBe(99999999);

      const backToRupees = RazorpayService.toRupees(paise);
      expect(backToRupees).toBe(largeAmount);
    });
  });
});
