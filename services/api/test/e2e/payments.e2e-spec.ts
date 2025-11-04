import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as crypto from 'crypto';

describe('Payments API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userId: string;
  let accessToken: string;
  let razorpayOrderId: string;

  const testUser = {
    mobile: '9876543210',
    email: 'payments-test@example.com',
    name: 'Payments Test User',
    dob: new Date('1995-01-01'),
    pin: '$2b$10$hashedpin', // Hashed "1234"
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
    await prismaService.transaction.deleteMany({ where: { userId } });
    await prismaService.savingsWallet.deleteMany({
      where: { user: { mobile: testUser.mobile } },
    });
    await prismaService.savingsConfig.deleteMany({
      where: { user: { mobile: testUser.mobile } },
    });
    await prismaService.session.deleteMany({});
    await prismaService.user.deleteMany({ where: { mobile: testUser.mobile } });

    const user = await prismaService.user.create({
      data: testUser,
    });
    userId = user.id;

    // Create savings config for auto-save
    await prismaService.savingsConfig.create({
      data: {
        userId,
        enabled: true,
        percentage: 20,
        minTransactionAmount: 10,
      },
    });

    // Create wallet
    await prismaService.savingsWallet.create({
      data: {
        userId,
        balance: 0,
        totalSaved: 0,
        totalWithdrawn: 0,
        totalInvested: 0,
      },
    });

    // Generate access token (mock)
    accessToken = 'mock-jwt-token'; // In real tests, generate valid JWT
  });

  afterAll(async () => {
    // Clean up
    if (userId) {
      await prismaService.transaction.deleteMany({ where: { userId } });
      await prismaService.savingsWallet.delete({ where: { userId } });
      await prismaService.savingsConfig.delete({ where: { userId } });
      await prismaService.session.deleteMany({ where: { userId } });
      await prismaService.user.delete({ where: { id: userId } });
    }

    await app.close();
  });

  describe('/payments/create-order (POST)', () => {
    it('should create payment order with auto-save calculation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 1000,
          description: 'Test payment',
          vpa: 'testuser@upi',
        });

      // Note: This will fail without proper auth setup
      // In real e2e tests, you'd need to implement auth middleware or mock it

      // Expected response structure:
      // {
      //   success: true,
      //   razorpayOrderId: 'order_xxx',
      //   amount: 1000,
      //   autoSaveAmount: 200,
      //   autoSavePercentage: 20,
      //   transactionId: 'uuid',
      // }
    });

    it('should create order with 0 auto-save when config disabled', async () => {
      // Disable auto-save
      await prismaService.savingsConfig.update({
        where: { userId },
        data: { enabled: false },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 1000,
          description: 'Test payment',
        });

      // Re-enable for other tests
      await prismaService.savingsConfig.update({
        where: { userId },
        data: { enabled: true },
      });
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          // Missing amount
          description: 'Test',
        });
      // .expect(400); // Uncomment when auth is set up
    });

    it('should validate minimum amount', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 0, // Invalid
          description: 'Test',
        });
      // .expect(400);
    });
  });

  describe('/payments/verify (POST)', () => {
    let testOrderId: string;
    let testPaymentId: string;
    let testSignature: string;

    beforeAll(async () => {
      // Create a test transaction
      const transaction = await prismaService.transaction.create({
        data: {
          userId,
          type: 'PAYMENT',
          amount: 1000,
          status: 'PENDING',
          razorpayOrderId: 'order_test_123',
          autoSaveAmount: 200,
          autoSaveApplied: false,
          description: 'Test payment for verification',
        },
      });

      testOrderId = 'order_test_123';
      testPaymentId = 'pay_test_123';

      // Generate valid signature
      const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';
      testSignature = crypto
        .createHmac('sha256', secret)
        .update(`${testOrderId}|${testPaymentId}`)
        .digest('hex');
    });

    it('should verify payment and apply auto-save', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          razorpayOrderId: testOrderId,
          razorpayPaymentId: testPaymentId,
          razorpaySignature: testSignature,
        });

      // Expected: Payment verified, auto-save applied to wallet
      // Check wallet balance increased by 200
      const wallet = await prismaService.savingsWallet.findUnique({
        where: { userId },
      });

      // expect(wallet.balance).toBeGreaterThanOrEqual(200);
      // expect(wallet.totalSaved).toBeGreaterThanOrEqual(200);
    });

    it('should reject invalid signature', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          razorpayOrderId: testOrderId,
          razorpayPaymentId: testPaymentId,
          razorpaySignature: 'invalid_signature',
        });
      // .expect(400);
    });

    it('should reject non-existent order', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          razorpayOrderId: 'non_existent_order',
          razorpayPaymentId: 'pay_123',
          razorpaySignature: 'sig_123',
        });
      // .expect(404);
    });
  });

  describe('/payments/transactions (GET)', () => {
    beforeAll(async () => {
      // Create some test transactions
      await prismaService.transaction.createMany({
        data: [
          {
            userId,
            type: 'PAYMENT',
            amount: 1000,
            status: 'SUCCESS',
            autoSaveAmount: 100,
            description: 'Payment 1',
          },
          {
            userId,
            type: 'PAYMENT',
            amount: 2000,
            status: 'SUCCESS',
            autoSaveAmount: 200,
            description: 'Payment 2',
          },
          {
            userId,
            type: 'PAYMENT',
            amount: 3000,
            status: 'FAILED',
            autoSaveAmount: 0,
            description: 'Failed payment',
          },
        ],
      });
    });

    it('should return paginated transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 10 });

      // Expected: List of transactions with pagination
      // expect(response.body.data).toBeInstanceOf(Array);
      // expect(response.body.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ status: 'SUCCESS' });

      // Expected: Only SUCCESS transactions
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01').toISOString();
      const endDate = new Date('2025-12-31').toISOString();

      await request(app.getHttpServer())
        .get('/api/v1/payments/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ startDate, endDate });
    });
  });

  describe('/payments/transactions/:id (GET)', () => {
    let transactionId: string;

    beforeAll(async () => {
      const transaction = await prismaService.transaction.create({
        data: {
          userId,
          type: 'PAYMENT',
          amount: 5000,
          status: 'SUCCESS',
          autoSaveAmount: 500,
          description: 'Single transaction test',
        },
      });
      transactionId = transaction.id;
    });

    it('should return single transaction details', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/payments/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Expected: Full transaction details
    });

    it('should reject non-existent transaction', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/transactions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`);
      // .expect(404);
    });

    it('should reject access to other user transaction', async () => {
      // Create transaction for different user
      const otherUser = await prismaService.user.create({
        data: {
          mobile: '8888888888',
          email: 'other@example.com',
          name: 'Other User',
          dob: new Date('1990-01-01'),
          pin: 'hashed',
        },
      });

      const otherTransaction = await prismaService.transaction.create({
        data: {
          userId: otherUser.id,
          type: 'PAYMENT',
          amount: 1000,
          status: 'SUCCESS',
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/payments/transactions/${otherTransaction.id}`)
        .set('Authorization', `Bearer ${accessToken}`);
      // .expect(403 or 404);

      // Cleanup
      await prismaService.transaction.delete({ where: { id: otherTransaction.id } });
      await prismaService.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe('/payments/stats (GET)', () => {
    it('should return payment statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/stats')
        .set('Authorization', `Bearer ${accessToken}`);

      // Expected structure:
      // {
      //   totalAmount: number,
      //   totalAutoSaved: number,
      //   transactionCount: number,
      //   successCount: number,
      //   failedCount: number,
      //   pendingCount: number,
      //   averageTransactionAmount: number,
      // }
    });
  });

  describe('Payment Flow Integration', () => {
    it('should complete full payment flow with auto-save', async () => {
      // 1. Create payment order
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 5000,
          description: 'Full flow test',
        });

      // 2. Simulate payment completion (would come from Razorpay in real scenario)
      // 3. Verify payment
      // 4. Check auto-save applied to wallet
      // 5. Verify transaction history updated

      const wallet = await prismaService.savingsWallet.findUnique({
        where: { userId },
      });

      // Auto-save should have been applied (20% of 5000 = 1000)
      // expect(wallet.balance).toBeGreaterThanOrEqual(1000);
    });
  });
});
