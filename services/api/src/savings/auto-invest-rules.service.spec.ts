import { Test, TestingModule } from '@nestjs/testing';
import { AutoInvestRulesService } from './auto-invest-rules.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TriggerType } from '@prisma/client';

describe('AutoInvestRulesService', () => {
  let service: AutoInvestRulesService;
  let prisma: PrismaService;

  const mockPrisma = {
    investmentProduct: {
      findUnique: jest.fn(),
    },
    autoInvestRule: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    savingsWallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoInvestRulesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AutoInvestRulesService>(AutoInvestRulesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createRule', () => {
    const userId = 'user-123';

    it('should create threshold rule with percentage allocation', async () => {
      const createDto = {
        productId: 'product-123',
        triggerType: TriggerType.THRESHOLD,
        triggerValue: 5000,
        investmentPercentage: 40,
        enabled: true,
      };

      const product = {
        id: 'product-123',
        name: 'Liquid Fund',
        minInvestment: 100,
        isActive: true,
      };

      const rule = {
        id: 'rule-123',
        userId,
        ...createDto,
        investmentAmount: null,
      };

      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);
      mockPrisma.autoInvestRule.create.mockResolvedValue(rule);

      const result = await service.createRule(userId, createDto);

      expect(result.id).toBe('rule-123');
      expect(result.investmentPercentage).toBe(40);
      expect(mockPrisma.autoInvestRule.create).toHaveBeenCalledWith({
        data: {
          userId,
          ...createDto,
        },
      });
    });

    it('should create rule with fixed amount', async () => {
      const createDto = {
        productId: 'product-123',
        triggerType: TriggerType.THRESHOLD,
        triggerValue: 5000,
        investmentAmount: 2000,
      };

      const product = {
        id: 'product-123',
        name: 'Equity Fund',
        minInvestment: 500,
        isActive: true,
      };

      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);
      mockPrisma.autoInvestRule.create.mockResolvedValue({
        id: 'rule-123',
        userId,
        ...createDto,
      });

      const result = await service.createRule(userId, createDto);

      expect(result.investmentAmount).toBe(2000);
    });

    it('should create scheduled rule', async () => {
      const createDto = {
        productId: 'product-123',
        triggerType: TriggerType.SCHEDULED,
        investmentPercentage: 100,
        schedule: '0 0 1 * *', // Monthly on 1st
      };

      const product = { id: 'product-123', isActive: true };

      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);
      mockPrisma.autoInvestRule.create.mockResolvedValue({
        id: 'rule-123',
        userId,
        ...createDto,
      });

      const result = await service.createRule(userId, createDto);

      expect(result.schedule).toBe('0 0 1 * *');
      expect(result.triggerType).toBe(TriggerType.SCHEDULED);
    });

    it('should reject if product does not exist', async () => {
      const createDto = {
        productId: 'invalid-product',
        triggerType: TriggerType.THRESHOLD,
        triggerValue: 5000,
        investmentPercentage: 40,
      };

      mockPrisma.investmentProduct.findUnique.mockResolvedValue(null);

      await expect(service.createRule(userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject if product is inactive', async () => {
      const createDto = {
        productId: 'product-123',
        triggerType: TriggerType.THRESHOLD,
        triggerValue: 5000,
        investmentPercentage: 40,
      };

      const product = {
        id: 'product-123',
        isActive: false,
      };

      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);

      await expect(service.createRule(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject if both percentage and amount are provided', async () => {
      const createDto = {
        productId: 'product-123',
        triggerType: TriggerType.THRESHOLD,
        triggerValue: 5000,
        investmentPercentage: 40,
        investmentAmount: 2000, // Can't have both
      };

      const product = { id: 'product-123', isActive: true };
      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);

      await expect(service.createRule(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject threshold rule without trigger value', async () => {
      const createDto = {
        productId: 'product-123',
        triggerType: TriggerType.THRESHOLD,
        investmentPercentage: 40,
        // Missing triggerValue
      };

      const product = { id: 'product-123', isActive: true };
      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);

      await expect(service.createRule(userId, createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject scheduled rule without schedule', async () => {
      const createDto = {
        productId: 'product-123',
        triggerType: TriggerType.SCHEDULED,
        investmentPercentage: 100,
        // Missing schedule
      };

      const product = { id: 'product-123', isActive: true };
      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);

      await expect(service.createRule(userId, createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserRules', () => {
    const userId = 'user-123';

    it('should return all user rules with product details', async () => {
      const rules = [
        {
          id: 'rule-1',
          userId,
          productId: 'product-1',
          investmentPercentage: 40,
          enabled: true,
        },
        {
          id: 'rule-2',
          userId,
          productId: 'product-2',
          investmentPercentage: 60,
          enabled: true,
        },
      ];

      const products = [
        { id: 'product-1', name: 'Liquid Fund', category: 'Liquid' },
        { id: 'product-2', name: 'Equity Fund', category: 'Equity' },
      ];

      mockPrisma.autoInvestRule.findMany.mockResolvedValue(rules);
      mockPrisma.investmentProduct.findUnique
        .mockResolvedValueOnce(products[0])
        .mockResolvedValueOnce(products[1]);

      const result = await service.getUserRules(userId);

      expect(result.rules).toHaveLength(2);
      expect(result.summary.totalRules).toBe(2);
      expect(result.summary.activeRules).toBe(2);
      expect(result.summary.totalAllocationPercentage).toBe(100);
    });

    it('should handle user with no rules', async () => {
      mockPrisma.autoInvestRule.findMany.mockResolvedValue([]);

      const result = await service.getUserRules(userId);

      expect(result.rules).toHaveLength(0);
      expect(result.summary.totalRules).toBe(0);
      expect(result.summary.totalAllocationPercentage).toBe(0);
    });

    it('should calculate allocation correctly with mixed rules', async () => {
      const rules = [
        {
          id: 'rule-1',
          productId: 'product-1',
          investmentPercentage: 30,
          enabled: true,
        },
        {
          id: 'rule-2',
          productId: 'product-2',
          investmentAmount: 1000, // Fixed amount, not percentage
          enabled: true,
        },
        {
          id: 'rule-3',
          productId: 'product-3',
          investmentPercentage: 20,
          enabled: false, // Disabled
        },
      ];

      mockPrisma.autoInvestRule.findMany.mockResolvedValue(rules);
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: 'product-1',
        name: 'Test',
      });

      const result = await service.getUserRules(userId);

      expect(result.summary.totalRules).toBe(3);
      expect(result.summary.activeRules).toBe(2);
      // Only percentage-based rules count in allocation
      expect(result.summary.totalAllocationPercentage).toBe(30);
    });
  });

  describe('updateRule', () => {
    const userId = 'user-123';
    const ruleId = 'rule-123';

    it('should update rule successfully', async () => {
      const rule = {
        id: ruleId,
        userId,
        productId: 'product-123',
        investmentPercentage: 40,
      };

      const updateDto = {
        investmentPercentage: 50,
        enabled: true,
      };

      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(rule);
      mockPrisma.autoInvestRule.update.mockResolvedValue({
        ...rule,
        ...updateDto,
      });

      const result = await service.updateRule(userId, ruleId, updateDto);

      expect(result.investmentPercentage).toBe(50);
    });

    it('should reject update for non-existent rule', async () => {
      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(null);

      await expect(
        service.updateRule(userId, ruleId, { investmentPercentage: 50 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject update for rule owned by another user', async () => {
      const rule = {
        id: ruleId,
        userId: 'other-user',
        productId: 'product-123',
      };

      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(rule);

      await expect(
        service.updateRule(userId, ruleId, { investmentPercentage: 50 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow changing from percentage to fixed amount', async () => {
      const rule = {
        id: ruleId,
        userId,
        productId: 'product-123',
        investmentPercentage: 40,
        investmentAmount: null,
      };

      const updateDto = {
        investmentAmount: 2000,
        investmentPercentage: null,
      };

      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(rule);
      mockPrisma.autoInvestRule.update.mockResolvedValue({
        ...rule,
        investmentAmount: 2000,
        investmentPercentage: null,
      });

      const result = await service.updateRule(userId, ruleId, updateDto);

      expect(result.investmentAmount).toBe(2000);
      expect(result.investmentPercentage).toBeNull();
    });
  });

  describe('executeAutoInvestment', () => {
    const userId = 'user-123';

    it('should execute multiple rules with percentage allocation', async () => {
      const wallet = {
        id: 'wallet-123',
        userId,
        balance: 10000,
        totalInvested: 5000,
      };

      const rules = [
        {
          id: 'rule-1',
          userId,
          productId: 'product-1',
          investmentPercentage: 40,
          enabled: true,
          triggerType: TriggerType.THRESHOLD,
          triggerValue: 5000,
        },
        {
          id: 'rule-2',
          userId,
          productId: 'product-2',
          investmentPercentage: 60,
          enabled: true,
          triggerType: TriggerType.THRESHOLD,
          triggerValue: 5000,
        },
      ];

      const products = [
        { id: 'product-1', name: 'Liquid Fund', minInvestment: 100 },
        { id: 'product-2', name: 'Equity Fund', minInvestment: 100 },
      ];

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);
      mockPrisma.autoInvestRule.findMany.mockResolvedValue(rules);
      mockPrisma.investmentProduct.findUnique
        .mockResolvedValueOnce(products[0])
        .mockResolvedValueOnce(products[1]);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.savingsWallet.update.mockResolvedValue({
        ...wallet,
        balance: 0,
        totalInvested: 15000,
      });

      mockPrisma.transaction.create.mockResolvedValue({
        id: 'txn-123',
        type: 'INVESTMENT',
      });

      mockPrisma.autoInvestRule.update.mockResolvedValue(rules[0]);

      const result = await service.executeAutoInvestment(userId);

      expect(result.success).toBe(true);
      expect(result.totalInvested).toBe(10000);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].amount).toBe(4000); // 40% of 10000
      expect(result.results[1].amount).toBe(6000); // 60% of 10000
    });

    it('should execute single rule with fixed amount', async () => {
      const wallet = {
        userId,
        balance: 5000,
      };

      const rule = {
        id: 'rule-1',
        userId,
        productId: 'product-1',
        investmentAmount: 2000,
        enabled: true,
        triggerType: TriggerType.THRESHOLD,
        triggerValue: 1000,
      };

      const product = { id: 'product-1', name: 'Gold', minInvestment: 500 };

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);
      mockPrisma.autoInvestRule.findMany.mockResolvedValue([rule]);
      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.savingsWallet.update.mockResolvedValue({
        ...wallet,
        balance: 3000,
      });

      mockPrisma.transaction.create.mockResolvedValue({ id: 'txn-123' });
      mockPrisma.autoInvestRule.update.mockResolvedValue(rule);

      const result = await service.executeAutoInvestment(userId);

      expect(result.success).toBe(true);
      expect(result.totalInvested).toBe(2000);
      expect(result.results[0].amount).toBe(2000);
    });

    it('should skip rules that do not meet threshold', async () => {
      const wallet = { userId, balance: 1000 };

      const rule = {
        id: 'rule-1',
        userId,
        productId: 'product-1',
        investmentPercentage: 100,
        enabled: true,
        triggerType: TriggerType.THRESHOLD,
        triggerValue: 5000, // Not met
      };

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);
      mockPrisma.autoInvestRule.findMany.mockResolvedValue([rule]);
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: 'product-1',
      });

      const result = await service.executeAutoInvestment(userId);

      expect(result.success).toBe(true);
      expect(result.totalInvested).toBe(0);
      expect(result.results).toHaveLength(0);
      expect(result.message).toContain('No rules executed');
    });

    it('should skip rules with insufficient balance for minInvestment', async () => {
      const wallet = { userId, balance: 1000 };

      const rule = {
        id: 'rule-1',
        userId,
        productId: 'product-1',
        investmentPercentage: 100,
        enabled: true,
        triggerType: TriggerType.THRESHOLD,
        triggerValue: 500,
      };

      const product = {
        id: 'product-1',
        minInvestment: 2000, // More than wallet balance
      };

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);
      mockPrisma.autoInvestRule.findMany.mockResolvedValue([rule]);
      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);

      const result = await service.executeAutoInvestment(userId);

      expect(result.success).toBe(true);
      expect(result.totalInvested).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    it('should handle zero balance wallet', async () => {
      const wallet = { userId, balance: 0 };

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);

      const result = await service.executeAutoInvestment(userId);

      expect(result.success).toBe(true);
      expect(result.totalInvested).toBe(0);
      expect(result.message).toContain('Insufficient balance');
    });

    it('should execute only enabled rules', async () => {
      const wallet = { userId, balance: 10000 };

      const rules = [
        {
          id: 'rule-1',
          productId: 'product-1',
          investmentPercentage: 50,
          enabled: true,
          triggerType: TriggerType.THRESHOLD,
          triggerValue: 1000,
        },
        {
          id: 'rule-2',
          productId: 'product-2',
          investmentPercentage: 50,
          enabled: false, // Disabled
          triggerType: TriggerType.THRESHOLD,
          triggerValue: 1000,
        },
      ];

      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);
      mockPrisma.autoInvestRule.findMany.mockResolvedValue(rules);
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: 'product-1',
        minInvestment: 100,
      });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.savingsWallet.update.mockResolvedValue(wallet);
      mockPrisma.transaction.create.mockResolvedValue({ id: 'txn-123' });
      mockPrisma.autoInvestRule.update.mockResolvedValue(rules[0]);

      const result = await service.executeAutoInvestment(userId);

      expect(result.results).toHaveLength(1); // Only enabled rule executed
      expect(result.results[0].ruleId).toBe('rule-1');
    });
  });

  describe('deleteRule', () => {
    const userId = 'user-123';
    const ruleId = 'rule-123';

    it('should delete rule successfully', async () => {
      const rule = { id: ruleId, userId };

      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(rule);
      mockPrisma.autoInvestRule.delete.mockResolvedValue(rule);

      const result = await service.deleteRule(userId, ruleId);

      expect(result.success).toBe(true);
      expect(mockPrisma.autoInvestRule.delete).toHaveBeenCalledWith({
        where: { id: ruleId },
      });
    });

    it('should reject deletion for non-existent rule', async () => {
      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(null);

      await expect(service.deleteRule(userId, ruleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject deletion for rule owned by another user', async () => {
      const rule = { id: ruleId, userId: 'other-user' };

      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(rule);

      await expect(service.deleteRule(userId, ruleId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('enableRule and disableRule', () => {
    const userId = 'user-123';
    const ruleId = 'rule-123';

    it('should enable rule', async () => {
      const rule = { id: ruleId, userId, enabled: false };

      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(rule);
      mockPrisma.autoInvestRule.update.mockResolvedValue({
        ...rule,
        enabled: true,
      });

      const result = await service.enableRule(userId, ruleId);

      expect(result.enabled).toBe(true);
    });

    it('should disable rule', async () => {
      const rule = { id: ruleId, userId, enabled: true };

      mockPrisma.autoInvestRule.findUnique.mockResolvedValue(rule);
      mockPrisma.autoInvestRule.update.mockResolvedValue({
        ...rule,
        enabled: false,
      });

      const result = await service.disableRule(userId, ruleId);

      expect(result.enabled).toBe(false);
    });
  });
});
