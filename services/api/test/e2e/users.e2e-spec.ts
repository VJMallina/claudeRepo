import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let userId: string;

  const testMobile = '8888888888';
  const testEmail = 'users-e2e@example.com';
  const testPin = '7890';

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
    await prismaService.otp.deleteMany({ where: { mobile: testMobile } });
    await prismaService.session.deleteMany({});
    await prismaService.user.deleteMany({ where: { mobile: testMobile } });

    // Create test user
    const user = await prismaService.user.create({
      data: {
        mobile: testMobile,
        email: testEmail,
        name: 'Users E2E Test',
        dob: new Date('1995-01-01'),
        pin: '$2b$10$K5xO9t5v5TjY5YJ5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J',
        savingsConfig: {
          create: {
            autoSaveEnabled: true,
            savingsPercentage: 10,
          },
        },
        savingsWallet: {
          create: {
            balance: 5000,
          },
        },
      },
    });
    userId = user.id;

    // Get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login/pin')
      .send({ mobile: testMobile, pin: testPin });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await prismaService.session.deleteMany({ where: { userId } });
      await prismaService.savingsWallet.deleteMany({ where: { userId } });
      await prismaService.savingsConfig.deleteMany({ where: { userId } });
      await prismaService.user.delete({ where: { id: userId } });
    }

    await app.close();
  });

  describe('/users/profile (GET)', () => {
    it('should return user profile with related data', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.mobile).toBe(testMobile);
          expect(res.body.email).toBe(testEmail);
          expect(res.body.name).toBe('Users E2E Test');
          expect(res.body).not.toHaveProperty('pin');
          expect(res.body.savingsConfig).toBeDefined();
          expect(res.body.savingsWallet).toBeDefined();
          expect(res.body.kycDocuments).toBeDefined();
        });
    });

    it('should reject request without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should include savings configuration', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.savingsConfig).toBeDefined();
          expect(res.body.savingsConfig.autoSaveEnabled).toBe(true);
          expect(res.body.savingsConfig.savingsPercentage).toBe(10);
        });
    });

    it('should include savings wallet', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.savingsWallet).toBeDefined();
          expect(res.body.savingsWallet.balance).toBe(5000);
        });
    });
  });

  describe('/users/profile (PUT)', () => {
    it('should update user profile successfully', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          email: 'updated-e2e@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.email).toBe('updated-e2e@example.com');
          expect(res.body).not.toHaveProperty('pin');
        });
    });

    it('should update only name', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Name Only Update' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Name Only Update');
        });
    });

    it('should update profile photo', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ profilePhoto: 'https://example.com/photo.jpg' })
        .expect(200)
        .expect((res) => {
          expect(res.body.profilePhoto).toBe('https://example.com/photo.jpg');
        });
    });

    it('should reject request without authentication', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .send({ name: 'Unauthorized' })
        .expect(401);
    });

    it('should handle empty update data', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(200);
    });
  });

  describe('/users/biometric/enable (PUT)', () => {
    it('should enable biometric authentication', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/biometric/enable')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.biometricEnabled).toBe(true);
        });
    });

    it('should reject request without authentication', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/biometric/enable')
        .expect(401);
    });

    it('should not expose PIN in response', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/biometric/enable')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('pin');
        });
    });
  });

  describe('/users/biometric/disable (PUT)', () => {
    it('should disable biometric authentication', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/biometric/disable')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.biometricEnabled).toBe(false);
        });
    });

    it('should reject request without authentication', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/biometric/disable')
        .expect(401);
    });

    it('should not expose PIN in response', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/biometric/disable')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('pin');
        });
    });
  });

  describe('Profile Update Validation', () => {
    it('should validate email format', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should preserve existing data when updating', async () => {
      const originalProfile = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      await request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'New Name' });

      const updatedProfile = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(updatedProfile.body.email).toBe(originalProfile.body.email);
      expect(updatedProfile.body.mobile).toBe(originalProfile.body.mobile);
    });
  });

  describe('Security', () => {
    it('should not expose PIN in any response', async () => {
      const profileResponse = await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(profileResponse.body).not.toHaveProperty('pin');

      const updateResponse = await request(app.getHttpServer())
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Security Test' });

      expect(updateResponse.body).not.toHaveProperty('pin');
    });

    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v1/users/profile' },
        { method: 'put', path: '/api/v1/users/profile' },
        { method: 'put', path: '/api/v1/users/biometric/enable' },
        { method: 'put', path: '/api/v1/users/biometric/disable' },
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          [endpoint.method](endpoint.path)
          .expect(401);
      }
    });
  });
});
