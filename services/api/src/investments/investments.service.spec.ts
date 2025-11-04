import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentsService } from './investments.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RiskLevel, InvestmentStatus } from '@prisma/client';

describe('InvestmentsService', () => {
  let service: InvestmentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    investmentProduct: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    investment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    savingsWallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    navHistory: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<InvestmentsService>(InvestmentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const createDto = {
      name: 'HDFC Liquid Fund',
      category: 'Liquid',
      riskLevel: RiskLevel.LOW,
      expectedReturn: 6.5,
      minInvestment: 100,
      exitLoad: 0.5,
      isActive: true,
    };

    it('should create product successfully', async () => {
      mockPrisma.investmentProduct.findFirst.mockResolvedValue(null);
      mockPrisma.investmentProduct.create.mockResolvedValue({
        id: 'product-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createProduct(createDto);

      expect(result.name).toBe(createDto.name);
      expect(result.category).toBe(createDto.category);
      expect(mockPrisma.investmentProduct.create).toHaveBeenCalled();
    });

    it('should reject duplicate product name', async () => {
      mockPrisma.investmentProduct.findFirst.mockResolvedValue({
        id: 'existing-product',
        name: createDto.name,
      });

      await expect(service.createProduct(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getProducts', () => {
    it('should return paginated products with current NAV', async () => {
      const products = [
        {
          id: 'product-1',
          name: 'Liquid Fund',
          category: 'Liquid',
          riskLevel: RiskLevel.LOW,
          expectedReturn: 6.5,
          minInvestment: 100,
          exitLoad: 0.5,
          isActive: true,
          navHistory: [{ nav: 1125.50 }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.investmentProduct.findMany.mockResolvedValue(products);
      mockPrisma.investmentProduct.count.mockResolvedValue(10);

      const result = await service.getProducts({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].currentNav).toBe(1125.50);
      expect(result.pagination.total).toBe(10);
    });

    it('should filter by category', async () => {
      mockPrisma.investmentProduct.findMany.mockResolvedValue([]);
      mockPrisma.investmentProduct.count.mockResolvedValue(0);

      await service.getProducts({ page: 1, limit: 10, category: 'Equity' });

      expect(mockPrisma.investmentProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'Equity' }),
        }),
      );
    });
  });

  describe('purchaseInvestment', () => {
    const userId = 'user-123';
    const purchaseDto = {
      productId: 'product-123',
      amount: 5000,
    };

    it('should purchase investment successfully', async () => {
      const product = {
        id: 'product-123',
        name: 'Liquid Fund',
        minInvestment: 100,
        isActive: true,
        navHistory: [{ nav: 1000 }],
      };

      const wallet = {
        userId,
        balance: 10000,
      };

      const investment = {
        id: 'inv-123',
        userId,
        productId: 'product-123',
        amountInvested: 5000,
        units: 5,
        nav: 1000,
        currentValue: 5000,
        returns: 0,
        status: InvestmentStatus.ACTIVE,
        product,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.investmentProduct.findUnique.mockResolvedValue(product);
      mockPrisma.savingsWallet.findUnique.mockResolvedValue(wallet);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          investment: {
            create: jest.fn().mockResolvedValue(investment),
          },
          savingsWallet: {
            update: jest.fn().mockResolvedValue({ ...wallet, balance: 5000 }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'txn-123' }),
          },
        });
      });

      const result = await service.purchaseInvestment(userId, purchaseDto);

      expect(result.success).toBe(true);
      expect(result.investment.amountInvested).toBe(5000);
      expect(result.investment.units).toBe(5);
    });

    it('should reject if product not found', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue(null);

      await expect(
        service.purchaseInvestment(userId, purchaseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if product is inactive', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: 'product-123',
        isActive: false,
        navHistory: [],
      });

      await expect(
        service.purchaseInvestment(userId, purchaseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if amount below minimum', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: 'product-123',
        minInvestment: 10000,
        isActive: true,
        navHistory: [{ nav: 1000 }],
      });

      await expect(
        service.purchaseInvestment(userId, { ...purchaseDto, amount: 500 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if insufficient wallet balance', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: 'product-123',
        minInvestment: 100,
        isActive: true,
        navHistory: [{ nav: 1000 }],
      });

      mockPrisma.savingsWallet.findUnique.mockResolvedValue({
        userId,
        balance: 1000, // Less than purchase amount
      });

      await expect(
        service.purchaseInvestment(userId, purchaseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if NAV not available', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: 'product-123',
        minInvestment: 100,
        isActive: true,
        navHistory: [], // No NAV
      });

      mockPrisma.savingsWallet.findUnique.mockResolvedValue({
        userId,
        balance: 10000,
      });

      await expect(
        service.purchaseInvestment(userId, purchaseDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('redeemInvestment', () => {
    const userId = 'user-123';
    const redeemDto = {
      investmentId: 'inv-123',
    };

    it('should redeem full investment successfully', async () => {
      const investment = {
        id: 'inv-123',
        userId,
        productId: 'product-123',
        amountInvested: 5000,
        units: 5,
        nav: 1000,
        status: InvestmentStatus.ACTIVE,
        product: {
          id: 'product-123',
          name: 'Liquid Fund',
          exitLoad: 0,
          navHistory: [{ nav: 1100 }], // NAV increased
        },
      };

      mockPrisma.investment.findUnique.mockResolvedValue(investment);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          investment: {
            update: jest.fn().mockResolvedValue({
              ...investment,
              status: InvestmentStatus.REDEEMED,
            }),
          },
          savingsWallet: {
            update: jest.fn().mockResolvedValue({ balance: 5500 }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'txn-123' }),
          },
        });
      });

      const result = await service.redeemInvestment(userId, redeemDto);

      expect(result.success).toBe(true);
      expect(result.redeemedAmount).toBe(5500); // 5 units * 1100 NAV
    });

    it('should redeem partial investment successfully', async () => {
      const investment = {
        id: 'inv-123',
        userId,
        amountInvested: 5000,
        units: 5,
        nav: 1000,
        status: InvestmentStatus.ACTIVE,
        product: {
          exitLoad: 0,
          navHistory: [{ nav: 1100 }],
        },
      };

      mockPrisma.investment.findUnique.mockResolvedValue(investment);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          investment: {
            update: jest.fn().mockResolvedValue({
              ...investment,
              units: 3,
              status: InvestmentStatus.PARTIAL_REDEEMED,
            }),
          },
          savingsWallet: {
            update: jest.fn().mockResolvedValue({ balance: 2200 }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'txn-123' }),
          },
        });
      });

      const result = await service.redeemInvestment(userId, {
        investmentId: 'inv-123',
        amount: 2200, // Redeem 2 units
      });

      expect(result.success).toBe(true);
    });

    it('should apply exit load on redemption', async () => {
      const investment = {
        id: 'inv-123',
        userId,
        amountInvested: 5000,
        units: 5,
        nav: 1000,
        status: InvestmentStatus.ACTIVE,
        product: {
          exitLoad: 1, // 1% exit load
          navHistory: [{ nav: 1100 }],
        },
      };

      mockPrisma.investment.findUnique.mockResolvedValue(investment);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          investment: {
            update: jest.fn().mockResolvedValue(investment),
          },
          savingsWallet: {
            update: jest.fn().mockResolvedValue({ balance: 5445 }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'txn-123' }),
          },
        });
      });

      const result = await service.redeemInvestment(userId, redeemDto);

      // Current value: 5 * 1100 = 5500
      // Exit load: 5500 * 1% = 55
      // Final amount: 5500 - 55 = 5445
      expect(result.redeemedAmount).toBe(5445);
    });

    it('should reject if investment not found', async () => {
      mockPrisma.investment.findUnique.mockResolvedValue(null);

      await expect(
        service.redeemInvestment(userId, redeemDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if investment belongs to different user', async () => {
      mockPrisma.investment.findUnique.mockResolvedValue({
        id: 'inv-123',
        userId: 'other-user',
      });

      await expect(
        service.redeemInvestment(userId, redeemDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if investment already redeemed', async () => {
      mockPrisma.investment.findUnique.mockResolvedValue({
        id: 'inv-123',
        userId,
        status: InvestmentStatus.REDEEMED,
      });

      await expect(
        service.redeemInvestment(userId, redeemDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPortfolio', () => {
    const userId = 'user-123';

    it('should calculate portfolio summary correctly', async () => {
      const investments = [
        {
          id: 'inv-1',
          userId,
          productId: 'product-1',
          amountInvested: 5000,
          units: 5,
          nav: 1000,
          status: InvestmentStatus.ACTIVE,
          product: {
            id: 'product-1',
            name: 'Liquid Fund',
            category: 'Liquid',
            navHistory: [{ nav: 1100 }],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'inv-2',
          userId,
          productId: 'product-2',
          amountInvested: 10000,
          units: 10,
          nav: 1000,
          status: InvestmentStatus.ACTIVE,
          product: {
            id: 'product-2',
            name: 'Equity Fund',
            category: 'Equity',
            navHistory: [{ nav: 1200 }],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.investment.findMany.mockResolvedValue(investments);

      const result = await service.getPortfolio(userId);

      expect(result.summary.totalInvested).toBe(15000);
      expect(result.summary.currentValue).toBe(17500); // 5*1100 + 10*1200
      expect(result.summary.totalReturns).toBe(2500);
      expect(result.summary.activeInvestments).toBe(2);
      expect(result.summary.breakdown).toHaveLength(2);
    });

    it('should return empty portfolio for user with no investments', async () => {
      mockPrisma.investment.findMany.mockResolvedValue([]);

      const result = await service.getPortfolio(userId);

      expect(result.summary.totalInvested).toBe(0);
      expect(result.summary.currentValue).toBe(0);
      expect(result.investments).toHaveLength(0);
    });

    it('should group by category in breakdown', async () => {
      const investments = [
        {
          userId,
          amountInvested: 5000,
          units: 5,
          nav: 1000,
          status: InvestmentStatus.ACTIVE,
          product: {
            category: 'Liquid',
            navHistory: [{ nav: 1100 }],
          },
        },
        {
          userId,
          amountInvested: 3000,
          units: 3,
          nav: 1000,
          status: InvestmentStatus.ACTIVE,
          product: {
            category: 'Liquid', // Same category
            navHistory: [{ nav: 1100 }],
          },
        },
      ];

      mockPrisma.investment.findMany.mockResolvedValue(investments);

      const result = await service.getPortfolio(userId);

      expect(result.summary.breakdown).toHaveLength(1);
      expect(result.summary.breakdown[0].category).toBe('Liquid');
      expect(result.summary.breakdown[0].invested).toBe(8000);
    });
  });

  describe('updateNav', () => {
    it('should create new NAV entry', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: 'product-123',
      });

      mockPrisma.navHistory.upsert.mockResolvedValue({
        id: 'nav-123',
        productId: 'product-123',
        nav: 1125.50,
        date: new Date(),
      });

      const result = await service.updateNav({
        productId: 'product-123',
        nav: 1125.50,
      });

      expect(result.success).toBe(true);
    });

    it('should reject if product not found', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue(null);

      await expect(
        service.updateNav({ productId: 'invalid', nav: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getNavHistory', () => {
    const productId = 'product-123';

    it('should return NAV history with summary', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: productId,
      });

      const history = [
        { id: '1', productId, nav: 1000, date: new Date('2025-01-01') },
        { id: '2', productId, nav: 1100, date: new Date('2025-01-15') },
        { id: '3', productId, nav: 1200, date: new Date('2025-01-31') },
      ];

      mockPrisma.navHistory.findMany.mockResolvedValue(history);

      const result = await service.getNavHistory({ productId, days: 30 });

      expect(result.history).toHaveLength(3);
      expect(result.summary.current).toBe(1200);
      expect(result.summary.highest).toBe(1200);
      expect(result.summary.lowest).toBe(1000);
      expect(result.summary.change).toBe(200);
      expect(result.summary.changePercentage).toBe(20);
    });

    it('should reject if no history found', async () => {
      mockPrisma.investmentProduct.findUnique.mockResolvedValue({
        id: productId,
      });

      mockPrisma.navHistory.findMany.mockResolvedValue([]);

      await expect(
        service.getNavHistory({ productId, days: 30 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
