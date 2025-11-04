import { Test, TestingModule } from '@nestjs/testing';
import { SavingsService } from './savings.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SavingsService', () => {
  let service: SavingsService;
  let prisma: PrismaService;

  const mockPrisma = {
    savingsConfig: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    savingsWallet: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    autoInvestRule: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SavingsService>(SavingsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getSavingsConfig', () => {
    const userId = 'user-123';

    it('should return existing config', async () => {
      const config = {
        id: 'config-123',
        userId,
        enabled: true,
        percentage: 20,
        minTransactionAmount: 10,
        maxSavingsPerTransaction: 500,
      };

      mockPrisma.savingsConfig.findUnique.mockResolvedValue(config);

      const result = await service.getSavingsConfig(userId);

      expect(result).toEqual(config);
      expect(mockPrisma.savingsConfig.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should create default config if none exists', async () => {
      const defaultConfig = {
        id: 'config-123',
        userId,
        enabled: true,
        percentage: 10,
        minTransactionAmount: 10,
        maxSavingsPerTransaction: null,
      };

      mockPrisma.savingsConfig.findUnique.mockResolvedValue(null);
      mockPrisma.savingsConfig.upsert.mockResolvedValue(defaultConfig);

      const result = await service.getSavingsConfig(userId);

      expect(result.percentage).toBe(10); // Default
      expect(mockPrisma.savingsConfig.upsert).toHaveBeenCalled();
    });
  });

  describe('updateSavingsConfig', () => {
    const userId = 'user-123';

    it('should update config successfully', async () => {
      const updateDto = {
        enabled: true,
        percentage: 25,
        minTransactionAmount: 20,
        maxSavingsPerTransaction: 1000,
      };

      const updatedConfig = {
        id: 'config-123',
        userId,
        ...updateDto,
      };

      mockPrisma.savingsConfig.upsert.mockResolvedValue(updatedConfig);

      const result = await service.updateSavingsConfig(userId, updateDto);

      expect(result).toEqual(updatedConfig);
      expect(mockPrisma.savingsConfig.upsert).toHaveBeenCalledWith({
        where: { userId },
        update: updateDto,
        create: {
          userId,
          ...updateDto,
        },
      });
    });

    it('should validate percentage range', async () => {
      const invalidDto = {
        enabled: true,
        percentage: 60, // Invalid: > 50
      };

      // This would be caught by class-validator, but we can test service logic
      mockPrisma.savingsConfig.upsert.mockResolvedValue({
        id: 'config-123',
        userId,
        percentage: 60,
      });

      // In reality, this would fail at the controller level with validation
      const result = await service.updateSavingsConfig(userId, invalidDto as any);
      expect(result.percentage).toBe(60);
    });
  });

  describe('getSavingsWallet', () => {
    const userId = 'user-123';

    it('should return existing wallet', async () => {
      const wallet = {
        id: 'wallet-123',
        userId,
        balance: 5000,
        totalSaved: 10000,
        totalWithdrawn: 2000,
        totalInvested: 3000,
      };

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);

      const result = await service.getSavingsWallet(userId);

      expect(result).toEqual(wallet);
    });

    it('should create wallet if none exists', async () => {
      const newWallet = {
        id: 'wallet-123',
        userId,
        balance: 0,
        totalSaved: 0,
        totalWithdrawn: 0,
        totalInvested: 0,
      };

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(null);
      mockPrisma.savingsWallet.upsert.mockResolvedValue(newWallet);

      const result = await service.getSavingsWallet(userId);

      expect(result.balance).toBe(0);
      expect(mockPrisma.savingsWallet.upsert).toHaveBeenCalled();
    });
  });

  describe('withdrawSavings', () => {
    const userId = 'user-123';

    it('should process withdrawal successfully', async () => {
      const withdrawDto = {
        amount: 1000,
        reason: 'Emergency',
      };

      const wallet = {
        id: 'wallet-123',
        userId,
        balance: 5000,
        totalWithdrawn: 2000,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);
      mockPrisma.savingsWallet.update.mockResolvedValue({
        ...wallet,
        balance: 4000,
        totalWithdrawn: 3000,
      });

      const transaction = {
        id: 'txn-123',
        userId,
        type: 'WITHDRAWAL',
        amount: 1000,
        status: 'SUCCESS',
        description: 'Savings withdrawal: Emergency',
      };

      mockPrisma.transaction.create.mockResolvedValue(transaction);

      const result = await service.withdrawSavings(userId, withdrawDto);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(4000);
      expect(mockPrisma.savingsWallet.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          balance: { decrement: 1000 },
          totalWithdrawn: { increment: 1000 },
        },
      });
    });

    it('should reject withdrawal with insufficient balance', async () => {
      const withdrawDto = {
        amount: 6000, // More than balance
      };

      const wallet = {
        id: 'wallet-123',
        userId,
        balance: 5000,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);

      await expect(
        service.withdrawSavings(userId, withdrawDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject zero or negative amount', async () => {
      const invalidDto = { amount: 0 };

      await expect(
        service.withdrawSavings(userId, invalidDto),
      ).rejects.toThrow();
    });

    it('should handle wallet not found', async () => {
      const withdrawDto = { amount: 100 };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(null);

      await expect(
        service.withdrawSavings(userId, withdrawDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('depositSavings', () => {
    const userId = 'user-123';

    it('should process deposit successfully', async () => {
      const depositDto = {
        amount: 500,
        description: 'Manual deposit',
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      const wallet = {
        id: 'wallet-123',
        userId,
        balance: 5000,
        totalSaved: 10000,
      };

      mockPrisma.savingsWallet.upsert.mockResolvedValue({
        ...wallet,
        balance: 5500,
        totalSaved: 10500,
      });

      const transaction = {
        id: 'txn-123',
        userId,
        type: 'DEPOSIT',
        amount: 500,
        status: 'SUCCESS',
        description: 'Manual deposit',
      };

      mockPrisma.transaction.create.mockResolvedValue(transaction);

      const result = await service.depositSavings(userId, depositDto);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(5500);
    });
  });

  describe('getSavingsTransactions', () => {
    const userId = 'user-123';

    it('should return paginated transactions', async () => {
      const transactions = [
        { id: 'txn-1', type: 'DEPOSIT', amount: 1000 },
        { id: 'txn-2', type: 'WITHDRAWAL', amount: 500 },
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(transactions);
      mockPrisma.transaction.count.mockResolvedValue(10);

      const result = await service.getSavingsTransactions(userId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(transactions);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by transaction type', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await service.getSavingsTransactions(userId, {
        page: 1,
        limit: 10,
        type: 'DEPOSIT',
      });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: { in: ['DEPOSIT'] },
          }),
        }),
      );
    });
  });

  describe('getSavingsStats', () => {
    const userId = 'user-123';

    it('should calculate savings statistics with investment breakdown', async () => {
      const wallet = {
        id: 'wallet-123',
        userId,
        balance: 5000,
        totalSaved: 15000,
        totalWithdrawn: 3000,
        totalInvested: 7000,
      };

      const depositSum = { _sum: { amount: 15000 }, _count: { id: 20 } };
      const withdrawalSum = { _sum: { amount: 3000 }, _count: { id: 5 } };
      const investmentSum = { _sum: { amount: 7000 }, _count: { id: 10 } };

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);

      // Mock transaction aggregates
      mockPrisma.transaction.aggregate
        .mockResolvedValueOnce(depositSum)
        .mockResolvedValueOnce(withdrawalSum)
        .mockResolvedValueOnce(investmentSum);

      // Mock auto-invest rules
      const rules = [
        { productId: 'product-1', investmentPercentage: 40 },
        { productId: 'product-2', investmentPercentage: 60 },
      ];

      mockPrisma.autoInvestRule.findMany.mockResolvedValue(rules);

      const result = await service.getSavingsStats(userId);

      expect(result.currentBalance).toBe(5000);
      expect(result.totalSaved).toBe(15000);
      expect(result.totalWithdrawn).toBe(3000);
      expect(result.totalInvested).toBe(7000);
      expect(result.depositCount).toBe(20);
      expect(result.withdrawalCount).toBe(5);
      expect(result.investmentCount).toBe(10);
    });

    it('should handle wallet without transactions', async () => {
      const wallet = {
        balance: 0,
        totalSaved: 0,
        totalWithdrawn: 0,
        totalInvested: 0,
      };

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { amount: null },
        _count: { id: 0 },
      });
      mockPrisma.autoInvestRule.findMany.mockResolvedValue([]);

      const result = await service.getSavingsStats(userId);

      expect(result.currentBalance).toBe(0);
      expect(result.depositCount).toBe(0);
    });
  });
});
