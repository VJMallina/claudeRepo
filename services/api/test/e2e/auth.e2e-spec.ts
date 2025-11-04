import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let createdUserId: string;
  let accessToken: string;
  let refreshToken: string;

  const testMobile = '9876543210';
  const testEmail = 'e2e-test@example.com';
  const testPin = '5678';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up test data before running tests
    await prismaService.otp.deleteMany({ where: { mobile: testMobile } });
    await prismaService.session.deleteMany({});
    await prismaService.user.deleteMany({ where: { mobile: testMobile } });
  });

  afterAll(async () => {
    // Clean up test data
    if (createdUserId) {
      await prismaService.session.deleteMany({ where: { userId: createdUserId } });
      await prismaService.user.delete({ where: { id: createdUserId } });
    }
    await prismaService.otp.deleteMany({ where: { mobile: testMobile } });

    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should send OTP for new mobile number', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ mobile: testMobile })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('OTP sent');
          expect(res.body.expiresIn).toBe(120);
        });
    });

    it('should reject invalid mobile number format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ mobile: '123' })
        .expect(400);
    });

    it('should reject already registered mobile', async () => {
      // First create a user
      await prismaService.user.create({
        data: {
          mobile: '9999999999',
          email: 'existing@example.com',
          name: 'Existing User',
          dob: new Date('1990-01-01'),
        },
      });

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ mobile: '9999999999' })
        .expect(409);
    });
  });

  describe('/auth/verify-otp (POST)', () => {
    let generatedOtp: string;

    beforeAll(async () => {
      // Generate OTP for testing
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ mobile: testMobile });

      // Fetch the OTP from database (in real tests, you'd use a fixed OTP in test env)
      const otpRecord = await prismaService.otp.findFirst({
        where: { mobile: testMobile, purpose: 'REGISTRATION' },
        orderBy: { createdAt: 'desc' },
      });
      generatedOtp = otpRecord.code;
    });

    it('should verify valid OTP', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ mobile: testMobile, code: generatedOtp })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('verified');
        });
    });

    it('should reject invalid OTP', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ mobile: testMobile, code: '000000' })
        .expect(401);
    });

    it('should reject missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ mobile: testMobile })
        .expect(400);
    });
  });

  describe('/auth/create-profile (POST)', () => {
    it('should create user profile with valid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/create-profile')
        .send({
          mobile: testMobile,
          email: testEmail,
          name: 'E2E Test User',
          dob: '1995-01-01',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.userId).toBeDefined();
          expect(res.body.mobile).toBe(testMobile);
          expect(res.body.email).toBe(testEmail);
          createdUserId = res.body.userId;
        });
    });

    it('should reject underage user', () => {
      const underageDate = new Date();
      underageDate.setFullYear(underageDate.getFullYear() - 17);

      return request(app.getHttpServer())
        .post('/api/v1/auth/create-profile')
        .send({
          mobile: '8888888888',
          email: 'underage@example.com',
          name: 'Underage User',
          dob: underageDate.toISOString().split('T')[0],
        })
        .expect(400);
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/create-profile')
        .send({
          mobile: '7777777777',
          email: testEmail,
          name: 'Duplicate Email',
          dob: '1995-01-01',
        })
        .expect(409);
    });
  });

  describe('/auth/set-pin (POST)', () => {
    it('should set PIN for user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/set-pin')
        .send({ userId: createdUserId, pin: testPin })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user.id).toBe(createdUserId);
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should reject weak PIN (sequential)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/set-pin')
        .send({ userId: createdUserId, pin: '1234' })
        .expect(400);
    });

    it('should reject weak PIN (repeated)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/set-pin')
        .send({ userId: createdUserId, pin: '1111' })
        .expect(400);
    });

    it('should reject invalid PIN length', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/set-pin')
        .send({ userId: createdUserId, pin: '12' })
        .expect(400);
    });
  });

  describe('/auth/login/pin (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login/pin')
        .send({ mobile: testMobile, pin: testPin })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.user.mobile).toBe(testMobile);
          expect(res.body.user).not.toHaveProperty('pin');
        });
    });

    it('should reject invalid PIN', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login/pin')
        .send({ mobile: testMobile, pin: '9999' })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login/pin')
        .send({ mobile: '1111111111', pin: '5678' })
        .expect(401);
    });
  });

  describe('/auth/login/otp (POST)', () => {
    it('should send OTP for existing user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login/otp')
        .send({ mobile: testMobile })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('OTP sent');
        });
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login/otp')
        .send({ mobile: '1111111111' })
        .expect(404);
    });
  });

  describe('/auth/login/verify-otp (POST)', () => {
    let loginOtp: string;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login/otp')
        .send({ mobile: testMobile });

      const otpRecord = await prismaService.otp.findFirst({
        where: { mobile: testMobile, purpose: 'LOGIN' },
        orderBy: { createdAt: 'desc' },
      });
      loginOtp = otpRecord.code;
    });

    it('should login with valid OTP', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login/verify-otp')
        .send({ mobile: testMobile, code: loginOtp })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
        });
    });

    it('should reject invalid OTP', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login/verify-otp')
        .send({ mobile: testMobile, code: '000000' })
        .expect(401);
    });
  });

  describe('/auth/refresh-token (POST)', () => {
    it('should refresh access token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.accessToken).not.toBe(accessToken);
        });
    });

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should return current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUserId);
          expect(res.body.mobile).toBe(testMobile);
          expect(res.body).not.toHaveProperty('pin');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('Logged out');
        });
    });

    it('should reject logout without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('/auth/reset-pin (POST)', () => {
    let resetOtp: string;

    beforeAll(async () => {
      // Generate OTP for reset
      await prismaService.otp.create({
        data: {
          mobile: testMobile,
          code: '999888',
          purpose: 'RESET_PIN',
          expiresAt: new Date(Date.now() + 2 * 60 * 1000),
          attempts: 0,
          verified: false,
        },
      });
      resetOtp = '999888';
    });

    it('should reset PIN with valid OTP', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/reset-pin')
        .send({
          mobile: testMobile,
          code: resetOtp,
          newPin: '9876',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('reset');
        });
    });

    it('should reject weak new PIN', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/reset-pin')
        .send({
          mobile: testMobile,
          code: resetOtp,
          newPin: '1234',
        })
        .expect(400);
    });
  });
});
