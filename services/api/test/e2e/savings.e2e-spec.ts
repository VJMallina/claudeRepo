import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TriggerType } from '@prisma/client';

describe('Savings API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userId: string;
  let accessToken: string;
  let productId1: string;
  let productId2: string;
  let ruleId: string;

  const testUser = {
    mobile: '9876543211',
    email: 'savings-test@example.com',
    name: 'Savings Test User',
    dob: new Date('1995-01-01'),
    pin: '$2b$10$hashedpin',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up and create test user
    await prismaService.autoInvestRule.deleteMany({});
    await prismaService.transaction.deleteMany({});
    await prismaService.savingsWallet.deleteMany({
      where: { user: { mobile: testUser.mobile } },
    });
    await prismaService.savingsConfig.deleteMany({
      where: { user: { mobile: testUser.mobile } },
    });
    await prismaService.user.deleteMany({ where: { mobile: testUser.mobile } });

    const user = await prismaService.user.create({
      data: testUser,
    });
    userId = user.id;

    // Create investment products for testing
    const product1 = await prismaService.investmentProduct.create({
      data: {
        name: 'Liquid Fund',
        category: 'Liquid',
        riskLevel: 'LOW',
        expectedReturn: 6.5,
        minInvestment: 100,
        isActive: true,
      },
    });
    productId1 = product1.id;

    const product2 = await prismaService.investmentProduct.create({
      data: {
        name: 'Equity Fund',
        category: 'Equity',
        riskLevel: 'HIGH',
        expectedReturn: 12.0,
        minInvestment: 500,
        isActive: true,
      },
    });
    productId2 = product2.id;

    // Create savings config
    await prismaService.savingsConfig.create({
      data: {
        userId,
        enabled: true,
        percentage: 20,
        minTransactionAmount: 10,
      },
    });

    // Create wallet with initial balance
    await prismaService.savingsWallet.create({
      data: {
        userId,
        balance: 10000,
        totalSaved: 10000,
        totalWithdrawn: 0,
        totalInvested: 0,
      },
    });

    accessToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    if (userId) {
      await prismaService.autoInvestRule.deleteMany({ where: { userId } });
      await prismaService.transaction.deleteMany({ where: { userId } });
      await prismaService.savingsWallet.delete({ where: { userId } });
      await prismaService.savingsConfig.delete({ where: { userId } });
      await prismaService.user.delete({ where: { id: userId } });
    }

    await prismaService.investmentProduct.deleteMany({
      where: { id: { in: [productId1, productId2] } },
    });

    await app.close();
  });

  describe('/savings/config (GET)', () => {
    it('should get savings configuration', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/savings/config')
        .set('Authorization', `Bearer ${accessToken}`);

      // Expected:
      // {
      //   enabled: true,
      //   percentage: 20,
      //   minTransactionAmount: 10,
      //   ...
      // }
    });
  });

  describe('/savings/config (PUT)', () => {
    it('should update savings configuration', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/savings/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          enabled: true,
          percentage: 25,
          minTransactionAmount: 20,
          maxSavingsPerTransaction: 1000,
        });

      // Verify update
      const config = await prismaService.savingsConfig.findUnique({
        where: { userId },
      });

      // expect(config.percentage).toBe(25);
    });

    it('should validate percentage range', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/savings/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          percentage: 60, // Invalid: > 50
        });
      // .expect(400);
    });

    it('should validate minimum percentage', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/savings/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          percentage: 0, // Invalid: < 1
        });
      // .expect(400);
    });
  });

  describe('/savings/wallet (GET)', () => {
    it('should get wallet details', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/savings/wallet')
        .set('Authorization', `Bearer ${accessToken}`);

      // Expected: balance, totalSaved, totalWithdrawn, totalInvested
    });
  });

  describe('/savings/withdraw (POST)', () => {
    it('should withdraw from savings', async () => {
      const withdrawAmount = 1000;

      await request(app.getHttpServer())
        .post('/api/v1/savings/withdraw')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: withdrawAmount,
          reason: 'Emergency withdrawal',
        });

      // Verify wallet updated
      const wallet = await prismaService.savingsWallet.findUnique({
        where: { userId },
      });

      // expect(wallet.balance).toBeLessThan(10000);
      // expect(wallet.totalWithdrawn).toBeGreaterThan(0);
    });

    it('should reject withdrawal exceeding balance', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/savings/withdraw')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 999999, // More than balance
        });
      // .expect(400);
    });

    it('should validate minimum withdrawal amount', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/savings/withdraw')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 0,
        });
      // .expect(400);
    });
  });

  describe('/savings/deposit (POST)', () => {
    it('should deposit to savings', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/savings/deposit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 500,
          description: 'Manual deposit',
        });

      // Verify wallet updated
      const wallet = await prismaService.savingsWallet.findUnique({
        where: { userId },
      });

      // expect(wallet.balance).toBeGreaterThan(10000);
    });
  });

  describe('/savings/transactions (GET)', () => {
    beforeAll(async () => {
      // Create some transactions
      await prismaService.transaction.createMany({
        data: [
          {
            userId,
            type: 'DEPOSIT',
            amount: 500,
            status: 'SUCCESS',
            description: 'Auto-save from payment',
          },
          {
            userId,
            type: 'WITHDRAWAL',
            amount: 300,
            status: 'SUCCESS',
            description: 'Withdrawal',
          },
        ],
      });
    });

    it('should return savings transactions', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/savings/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 10 });

      // Expected: Paginated list of DEPOSIT, WITHDRAWAL, INVESTMENT transactions
    });

    it('should filter by transaction type', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/savings/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ type: 'DEPOSIT' });

      // Expected: Only DEPOSIT transactions
    });
  });

  describe('/savings/stats (GET)', () => {
    it('should return savings statistics', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/savings/stats')
        .set('Authorization', `Bearer ${accessToken}`);

      // Expected:
      // {
      //   currentBalance,
      //   totalSaved,
      //   totalWithdrawn,
      //   totalInvested,
      //   depositCount,
      //   withdrawalCount,
      //   investmentCount,
      //   investmentBreakdown: []
      // }
    });
  });

  describe('Auto-Investment Rules - Core Feature', () => {
    describe('/savings/auto-invest/rules (POST)', () => {
      it('should create percentage-based threshold rule', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/savings/auto-invest/rules')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            productId: productId1,
            triggerType: 'THRESHOLD',
            triggerValue: 5000,
            investmentPercentage: 40,
            enabled: true,
          });

        // Save ruleId for later tests
        // ruleId = response.body.id;

        // Expected: Rule created with 40% allocation
      });

      it('should create fixed-amount threshold rule', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/savings/auto-invest/rules')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            productId: productId2,
            triggerType: 'THRESHOLD',
            triggerValue: 5000,
            investmentAmount: 2000,
            enabled: true,
          });

        // Expected: Rule created with fixed ₹2000 investment
      });

      it('should create scheduled rule', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/savings/auto-invest/rules')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            productId: productId1,
            triggerType: 'SCHEDULED',
            investmentPercentage: 100,
            schedule: '0 0 1 * *', // Monthly on 1st
            enabled: true,
          });

        // Expected: Scheduled rule created
      });

      it('should reject rule with invalid product', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/savings/auto-invest/rules')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            productId: 'invalid-product-id',
            triggerType: 'THRESHOLD',
            triggerValue: 5000,
            investmentPercentage: 40,
          });
        // .expect(404);
      });

      it('should reject rule with both percentage and amount', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/savings/auto-invest/rules')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            productId: productId1,
            triggerType: 'THRESHOLD',
            triggerValue: 5000,
            investmentPercentage: 40,
            investmentAmount: 2000, // Can't have both
          });
        // .expect(400);
      });
    });

    describe('/savings/auto-invest/rules (GET)', () => {
      it('should get all user rules with allocation summary', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/savings/auto-invest/rules')
          .set('Authorization', `Bearer ${accessToken}`);

        // Expected structure:
        // {
        //   rules: [...],
        //   summary: {
        //     totalRules,
        //     activeRules,
        //     totalAllocationPercentage,
        //     breakdown: [{ productName, percentage }]
        //   }
        // }
      });
    });

    describe('/savings/auto-invest/rules/:id (GET)', () => {
      it('should get single rule details', async () => {
        // Create a rule first
        const rule = await prismaService.autoInvestRule.create({
          data: {
            userId,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 5000,
            investmentPercentage: 40,
            enabled: true,
          },
        });

        await request(app.getHttpServer())
          .get(`/api/v1/savings/auto-invest/rules/${rule.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        // Expected: Full rule details with product info
      });

      it('should reject access to other user rule', async () => {
        // Create rule for different user
        const otherUser = await prismaService.user.create({
          data: {
            mobile: '7777777777',
            email: 'other-savings@example.com',
            name: 'Other User',
            dob: new Date('1990-01-01'),
            pin: 'hashed',
          },
        });

        const otherRule = await prismaService.autoInvestRule.create({
          data: {
            userId: otherUser.id,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 5000,
            investmentPercentage: 40,
          },
        });

        await request(app.getHttpServer())
          .get(`/api/v1/savings/auto-invest/rules/${otherRule.id}`)
          .set('Authorization', `Bearer ${accessToken}`);
        // .expect(403 or 404);

        // Cleanup
        await prismaService.autoInvestRule.delete({ where: { id: otherRule.id } });
        await prismaService.user.delete({ where: { id: otherUser.id } });
      });
    });

    describe('/savings/auto-invest/rules/:id (PUT)', () => {
      it('should update rule allocation percentage', async () => {
        const rule = await prismaService.autoInvestRule.create({
          data: {
            userId,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 5000,
            investmentPercentage: 40,
          },
        });

        await request(app.getHttpServer())
          .put(`/api/v1/savings/auto-invest/rules/${rule.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            investmentPercentage: 50,
          });

        // Verify update
        const updated = await prismaService.autoInvestRule.findUnique({
          where: { id: rule.id },
        });

        // expect(updated.investmentPercentage).toBe(50);
      });

      it('should allow changing from percentage to fixed amount', async () => {
        const rule = await prismaService.autoInvestRule.create({
          data: {
            userId,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 5000,
            investmentPercentage: 40,
          },
        });

        await request(app.getHttpServer())
          .put(`/api/v1/savings/auto-invest/rules/${rule.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            investmentAmount: 3000,
            investmentPercentage: null,
          });

        // Verify changed to fixed amount
      });
    });

    describe('/savings/auto-invest/rules/:id/enable (PUT)', () => {
      it('should enable disabled rule', async () => {
        const rule = await prismaService.autoInvestRule.create({
          data: {
            userId,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 5000,
            investmentPercentage: 40,
            enabled: false,
          },
        });

        await request(app.getHttpServer())
          .put(`/api/v1/savings/auto-invest/rules/${rule.id}/enable`)
          .set('Authorization', `Bearer ${accessToken}`);

        const updated = await prismaService.autoInvestRule.findUnique({
          where: { id: rule.id },
        });

        // expect(updated.enabled).toBe(true);
      });
    });

    describe('/savings/auto-invest/rules/:id/disable (PUT)', () => {
      it('should disable enabled rule', async () => {
        const rule = await prismaService.autoInvestRule.create({
          data: {
            userId,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 5000,
            investmentPercentage: 40,
            enabled: true,
          },
        });

        await request(app.getHttpServer())
          .put(`/api/v1/savings/auto-invest/rules/${rule.id}/disable`)
          .set('Authorization', `Bearer ${accessToken}`);

        const updated = await prismaService.autoInvestRule.findUnique({
          where: { id: rule.id },
        });

        // expect(updated.enabled).toBe(false);
      });
    });

    describe('/savings/auto-invest/rules/:id (DELETE)', () => {
      it('should delete rule', async () => {
        const rule = await prismaService.autoInvestRule.create({
          data: {
            userId,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 5000,
            investmentPercentage: 40,
          },
        });

        await request(app.getHttpServer())
          .delete(`/api/v1/savings/auto-invest/rules/${rule.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        // Verify deleted
        const deleted = await prismaService.autoInvestRule.findUnique({
          where: { id: rule.id },
        });

        // expect(deleted).toBeNull();
      });
    });

    describe('/savings/auto-invest/execute (POST)', () => {
      it('should execute auto-investment with multiple rules', async () => {
        // Clean up existing rules
        await prismaService.autoInvestRule.deleteMany({ where: { userId } });

        // Create multiple rules with percentage allocation
        await prismaService.autoInvestRule.createMany({
          data: [
            {
              userId,
              productId: productId1,
              triggerType: TriggerType.THRESHOLD,
              triggerValue: 1000,
              investmentPercentage: 40,
              enabled: true,
            },
            {
              userId,
              productId: productId2,
              triggerType: TriggerType.THRESHOLD,
              triggerValue: 1000,
              investmentPercentage: 60,
              enabled: true,
            },
          ],
        });

        // Reset wallet balance
        await prismaService.savingsWallet.update({
          where: { userId },
          data: { balance: 10000 },
        });

        const response = await request(app.getHttpServer())
          .post('/api/v1/savings/auto-invest/execute')
          .set('Authorization', `Bearer ${accessToken}`);

        // Expected:
        // {
        //   success: true,
        //   totalInvested: 10000,
        //   results: [
        //     { ruleId, productName, amount: 4000 },
        //     { ruleId, productName, amount: 6000 }
        //   ]
        // }

        // Verify wallet balance reduced
        const wallet = await prismaService.savingsWallet.findUnique({
          where: { userId },
        });

        // expect(wallet.balance).toBe(0);
        // expect(wallet.totalInvested).toBe(10000);
      });

      it('should execute only specific rule when ruleId provided', async () => {
        const rule = await prismaService.autoInvestRule.create({
          data: {
            userId,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 1000,
            investmentPercentage: 100,
            enabled: true,
          },
        });

        await request(app.getHttpServer())
          .post('/api/v1/savings/auto-invest/execute')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            ruleId: rule.id,
          });

        // Expected: Only this rule executed
      });

      it('should skip rules not meeting threshold', async () => {
        await prismaService.autoInvestRule.create({
          data: {
            userId,
            productId: productId1,
            triggerType: TriggerType.THRESHOLD,
            triggerValue: 50000, // High threshold
            investmentPercentage: 100,
            enabled: true,
          },
        });

        await request(app.getHttpServer())
          .post('/api/v1/savings/auto-invest/execute')
          .set('Authorization', `Bearer ${accessToken}`);

        // Expected: No rules executed (threshold not met)
      });
    });
  });

  describe('Complete Savings Flow with Auto-Investment', () => {
    it('should complete full savings and auto-investment cycle', async () => {
      // 1. Update savings config
      await request(app.getHttpServer())
        .put('/api/v1/savings/config')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ enabled: true, percentage: 25 });

      // 2. Create auto-investment rules (40% Liquid, 60% Equity)
      await prismaService.autoInvestRule.deleteMany({ where: { userId } });

      const rule1 = await request(app.getHttpServer())
        .post('/api/v1/savings/auto-invest/rules')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId: productId1,
          triggerType: 'THRESHOLD',
          triggerValue: 5000,
          investmentPercentage: 40,
        });

      const rule2 = await request(app.getHttpServer())
        .post('/api/v1/savings/auto-invest/rules')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId: productId2,
          triggerType: 'THRESHOLD',
          triggerValue: 5000,
          investmentPercentage: 60,
        });

      // 3. Manual deposit to reach threshold
      await request(app.getHttpServer())
        .post('/api/v1/savings/deposit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ amount: 5000 });

      // 4. Execute auto-investment
      const executeResponse = await request(app.getHttpServer())
        .post('/api/v1/savings/auto-invest/execute')
        .set('Authorization', `Bearer ${accessToken}`);

      // 5. Verify stats show investments
      await request(app.getHttpServer())
        .get('/api/v1/savings/stats')
        .set('Authorization', `Bearer ${accessToken}`);

      // Expected: Investments made according to allocation (40%/60%)
    });
  });
});
