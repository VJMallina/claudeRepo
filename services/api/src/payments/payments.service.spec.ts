import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { RazorpayService } from './razorpay.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let razorpay: RazorpayService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    savingsConfig: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    savingsWallet: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockRazorpay = {
    createOrder: jest.fn(),
    verifyPaymentSignature: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: RazorpayService,
          useValue: mockRazorpay,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    razorpay = module.get<RazorpayService>(RazorpayService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createPaymentOrder', () => {
    const userId = 'user-123';
    const createPaymentDto = {
      amount: 1000,
      description: 'Test payment',
      vpa: 'user@upi',
    };

    it('should create payment order with auto-save calculation', async () => {
      const savingsConfig = {
        id: 'config-123',
        userId,
        enabled: true,
        percentage: 20,
        minTransactionAmount: 10,
        maxSavingsPerTransaction: null,
      };

      const razorpayOrder = {
        id: 'order_123',
        amount: 100000,
        currency: 'INR',
        status: 'created',
      };

      const transaction = {
        id: 'txn-123',
        userId,
        type: 'PAYMENT',
        amount: 1000,
        status: 'PENDING',
        razorpayOrderId: 'order_123',
        autoSaveAmount: 200,
        autoSaveApplied: false,
        vpa: 'user@upi',
        description: 'Test payment',
      };

      mockPrisma.savingsConfig.findUnique.mockResolvedValue(savingsConfig);
      mockRazorpay.createOrder.mockResolvedValue(razorpayOrder);
      mockPrisma.transaction.create.mockResolvedValue(transaction);

      const result = await service.createPaymentOrder(userId, createPaymentDto);

      expect(result.autoSaveAmount).toBe(200); // 20% of 1000
      expect(result.autoSavePercentage).toBe(20);
      expect(mockRazorpay.createOrder).toHaveBeenCalledWith({
        amount: 100000, // 1000 * 100 (paise)
        currency: 'INR',
        notes: {
          userId,
          autoSaveAmount: 200,
          autoSavePercentage: 20,
          vpa: 'user@upi',
          description: 'Test payment',
        },
      });
    });

    it('should create order with 0 auto-save when disabled', async () => {
      const savingsConfig = {
        id: 'config-123',
        userId,
        enabled: false,
        percentage: 20,
      };

      mockPrisma.savingsConfig.findUnique.mockResolvedValue(savingsConfig);
      mockRazorpay.createOrder.mockResolvedValue({ id: 'order_123' });
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'txn-123',
        autoSaveAmount: 0,
      });

      const result = await service.createPaymentOrder(userId, createPaymentDto);

      expect(result.autoSaveAmount).toBe(0);
    });

    it('should use default 10% when no config exists', async () => {
      mockPrisma.savingsConfig.findUnique.mockResolvedValue(null);
      mockRazorpay.createOrder.mockResolvedValue({ id: 'order_123' });
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'txn-123',
        autoSaveAmount: 100, // 10% of 1000
      });

      const result = await service.createPaymentOrder(userId, createPaymentDto);

      expect(result.autoSaveAmount).toBe(100);
    });

    it('should respect maxSavingsPerTransaction limit', async () => {
      const savingsConfig = {
        enabled: true,
        percentage: 50,
        maxSavingsPerTransaction: 100,
      };

      mockPrisma.savingsConfig.findUnique.mockResolvedValue(savingsConfig);
      mockRazorpay.createOrder.mockResolvedValue({ id: 'order_123' });
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'txn-123',
        autoSaveAmount: 100, // Capped at max
      });

      const result = await service.createPaymentOrder(userId, createPaymentDto);

      expect(result.autoSaveAmount).toBe(100);
    });
  });

  describe('verifyPayment', () => {
    const userId = 'user-123';
    const verifyDto = {
      razorpayOrderId: 'order_123',
      razorpayPaymentId: 'pay_123',
      razorpaySignature: 'signature_123',
    };

    it('should verify payment and apply auto-save', async () => {
      const transaction = {
        id: 'txn-123',
        userId,
        status: 'PENDING',
        amount: 1000,
        autoSaveAmount: 200,
        razorpayOrderId: 'order_123',
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(transaction);
      mockRazorpay.verifyPaymentSignature.mockReturnValue(true);

      // Mock the atomic transaction
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.transaction.update.mockResolvedValue({
        ...transaction,
        status: 'SUCCESS',
        autoSaveApplied: true,
      });

      const result = await service.verifyPayment(userId, verifyDto);

      expect(result.success).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(mockRazorpay.verifyPaymentSignature).toHaveBeenCalled();
    });

    it('should throw error for invalid signature', async () => {
      const transaction = {
        id: 'txn-123',
        userId,
        status: 'PENDING',
        razorpayOrderId: 'order_123',
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(transaction);
      mockRazorpay.verifyPaymentSignature.mockReturnValue(false);

      await expect(service.verifyPayment(userId, verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.verifyPayment(userId, verifyDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error for already completed transaction', async () => {
      const transaction = {
        id: 'txn-123',
        userId,
        status: 'SUCCESS',
        razorpayOrderId: 'order_123',
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(transaction);

      await expect(service.verifyPayment(userId, verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for mismatched user', async () => {
      const transaction = {
        id: 'txn-123',
        userId: 'other-user',
        status: 'PENDING',
        razorpayOrderId: 'order_123',
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(transaction);

      await expect(service.verifyPayment(userId, verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTransactions', () => {
    const userId = 'user-123';

    it('should return paginated transactions', async () => {
      const transactions = [
        { id: 'txn-1', amount: 1000, status: 'SUCCESS' },
        { id: 'txn-2', amount: 2000, status: 'SUCCESS' },
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(transactions);
      mockPrisma.transaction.count.mockResolvedValue(10);

      const result = await service.getTransactions(userId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(transactions);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await service.getTransactions(userId, {
        page: 1,
        limit: 10,
        status: 'SUCCESS',
      });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SUCCESS',
          }),
        }),
      );
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await service.getTransactions(userId, {
        page: 1,
        limit: 10,
        startDate,
        endDate,
      });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        }),
      );
    });
  });

  describe('getPaymentStats', () => {
    const userId = 'user-123';

    it('should calculate payment statistics', async () => {
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 10000, autoSaveAmount: 2000 },
        _count: { id: 5 },
      });

      mockPrisma.transaction.count.mockResolvedValueOnce(5); // Success count
      mockPrisma.transaction.count.mockResolvedValueOnce(1); // Failed count
      mockPrisma.transaction.count.mockResolvedValueOnce(0); // Pending count

      const result = await service.getPaymentStats(userId);

      expect(result.totalAmount).toBe(10000);
      expect(result.totalAutoSaved).toBe(2000);
      expect(result.transactionCount).toBe(5);
      expect(result.successCount).toBe(5);
      expect(result.failedCount).toBe(1);
    });

    it('should handle zero transactions', async () => {
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { amount: null, autoSaveAmount: null },
        _count: { id: 0 },
      });

      mockPrisma.transaction.count.mockResolvedValue(0);

      const result = await service.getPaymentStats(userId);

      expect(result.totalAmount).toBe(0);
      expect(result.totalAutoSaved).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });
});
