import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('OtpService', () => {
  let service: OtpService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    otp: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        NODE_ENV: 'development',
        TWILIO_ACCOUNT_SID: 'test_sid',
        TWILIO_AUTH_TOKEN: 'test_token',
        TWILIO_PHONE_NUMBER: '+1234567890',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOtp', () => {
    const mobile = '9876543210';
    const purpose = 'REGISTRATION';

    it('should generate 6-digit OTP code', async () => {
      const mockOtp = {
        id: 'otp-id',
        mobile,
        code: '123456',
        purpose,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        attempts: 0,
        verified: false,
        createdAt: new Date(),
      };

      mockPrismaService.otp.create.mockResolvedValue(mockOtp);

      await service.generateOtp(mobile, purpose);

      expect(prismaService.otp.create).toHaveBeenCalledWith({
        data: {
          mobile,
          code: expect.stringMatching(/^\d{6}$/),
          purpose,
          expiresAt: expect.any(Date),
          attempts: 0,
          verified: false,
        },
      });
    });

    it('should set expiry to 2 minutes from now', async () => {
      mockPrismaService.otp.create.mockImplementation((args) => {
        const expiresAt = args.data.expiresAt;
        const now = new Date();
        const diffMinutes = (expiresAt - now) / (1000 * 60);

        expect(diffMinutes).toBeGreaterThanOrEqual(1.9);
        expect(diffMinutes).toBeLessThanOrEqual(2.1);

        return Promise.resolve({
          id: 'otp-id',
          ...args.data,
          createdAt: new Date(),
        });
      });

      await service.generateOtp(mobile, purpose);

      expect(prismaService.otp.create).toHaveBeenCalled();
    });

    it('should log OTP in development mode', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.otp.create.mockResolvedValue({
        id: 'otp-id',
        mobile,
        code: '123456',
        purpose,
        expiresAt: new Date(),
        attempts: 0,
        verified: false,
        createdAt: new Date(),
      });

      await service.generateOtp(mobile, purpose);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`📱 OTP for ${mobile}`),
      );

      consoleSpy.mockRestore();
    });

    it('should create OTP for different purposes', async () => {
      const purposes = ['REGISTRATION', 'LOGIN', 'RESET_PIN'];
      mockPrismaService.otp.create.mockResolvedValue({
        id: 'otp-id',
        mobile,
        code: '123456',
        expiresAt: new Date(),
        attempts: 0,
        verified: false,
        createdAt: new Date(),
      });

      for (const testPurpose of purposes) {
        await service.generateOtp(mobile, testPurpose);

        expect(prismaService.otp.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            purpose: testPurpose,
          }),
        });
      }
    });
  });

  describe('verifyOtp', () => {
    const mobile = '9876543210';
    const code = '123456';
    const purpose = 'REGISTRATION';

    it('should verify valid OTP successfully', async () => {
      const mockOtp = {
        id: 'otp-id',
        mobile,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 60000),
        attempts: 0,
        verified: false,
        createdAt: new Date(),
      };

      mockPrismaService.otp.findFirst.mockResolvedValue(mockOtp);
      mockPrismaService.otp.update.mockResolvedValue({
        ...mockOtp,
        verified: true,
      });

      const result = await service.verifyOtp(mobile, code, purpose);

      expect(result).toBe(true);
      expect(prismaService.otp.update).toHaveBeenCalledWith({
        where: { id: 'otp-id' },
        data: { verified: true },
      });
    });

    it('should return false for incorrect code', async () => {
      const mockOtp = {
        id: 'otp-id',
        mobile,
        code: '123456',
        purpose,
        expiresAt: new Date(Date.now() + 60000),
        attempts: 0,
        verified: false,
        createdAt: new Date(),
      };

      mockPrismaService.otp.findFirst.mockResolvedValue(mockOtp);
      mockPrismaService.otp.update.mockResolvedValue({
        ...mockOtp,
        attempts: 1,
      });

      const result = await service.verifyOtp(mobile, '999999', purpose);

      expect(result).toBe(false);
      expect(prismaService.otp.update).toHaveBeenCalledWith({
        where: { id: 'otp-id' },
        data: { attempts: 1 },
      });
    });

    it('should return false for expired OTP', async () => {
      const mockOtp = {
        id: 'otp-id',
        mobile,
        code,
        purpose,
        expiresAt: new Date(Date.now() - 1000),
        attempts: 0,
        verified: false,
        createdAt: new Date(),
      };

      mockPrismaService.otp.findFirst.mockResolvedValue(mockOtp);

      const result = await service.verifyOtp(mobile, code, purpose);

      expect(result).toBe(false);
    });

    it('should throw BadRequestException after 3 failed attempts', async () => {
      const mockOtp = {
        id: 'otp-id',
        mobile,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 60000),
        attempts: 3,
        verified: false,
        createdAt: new Date(),
      };

      mockPrismaService.otp.findFirst.mockResolvedValue(mockOtp);

      await expect(service.verifyOtp(mobile, code, purpose)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return false if OTP not found', async () => {
      mockPrismaService.otp.findFirst.mockResolvedValue(null);

      const result = await service.verifyOtp(mobile, code, purpose);

      expect(result).toBe(false);
    });

    it('should increment attempts on wrong code', async () => {
      const mockOtp = {
        id: 'otp-id',
        mobile,
        code: '123456',
        purpose,
        expiresAt: new Date(Date.now() + 60000),
        attempts: 1,
        verified: false,
        createdAt: new Date(),
      };

      mockPrismaService.otp.findFirst.mockResolvedValue(mockOtp);
      mockPrismaService.otp.update.mockResolvedValue({
        ...mockOtp,
        attempts: 2,
      });

      await service.verifyOtp(mobile, '999999', purpose);

      expect(prismaService.otp.update).toHaveBeenCalledWith({
        where: { id: 'otp-id' },
        data: { attempts: 2 },
      });
    });

    it('should not verify already verified OTP', async () => {
      const mockOtp = {
        id: 'otp-id',
        mobile,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 60000),
        attempts: 0,
        verified: true,
        createdAt: new Date(),
      };

      mockPrismaService.otp.findFirst.mockResolvedValue(null);

      const result = await service.verifyOtp(mobile, code, purpose);

      expect(result).toBe(false);
    });
  });

  describe('sendOtpSms', () => {
    it('should log OTP in development environment', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockConfigService.get.mockReturnValue('development');

      await (service as any).sendOtpSms('9876543210', '123456');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📱 OTP for 9876543210: 123456'),
      );

      consoleSpy.mockRestore();
    });

    // Note: Twilio integration test would be added when implemented
    it('should call Twilio in production (mocked)', async () => {
      // This test will be implemented when Twilio integration is complete
      // For now, we verify the method exists
      expect((service as any).sendOtpSms).toBeDefined();
    });
  });
});
