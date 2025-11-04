import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let otpService: OtpService;
  let configService: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockOtpService = {
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_ACCESS_TOKEN_EXPIRY: '15m',
        JWT_REFRESH_TOKEN_EXPIRY: '7d',
      };
      return config[key];
    }),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    mobile: '9876543210',
    email: 'test@example.com',
    name: 'Test User',
    dob: new Date('1995-01-01'),
    pin: '$2b$10$hashedpin',
    kycStatus: 'PENDING',
    biometricEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    otpService = module.get<OtpService>(OtpService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = { mobile: '9876543210' };

    it('should send OTP for new mobile number', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockOtpService.generateOtp.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        success: true,
        message: 'OTP sent to your mobile number',
        expiresIn: 120,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { mobile: '9876543210' },
      });
      expect(otpService.generateOtp).toHaveBeenCalledWith(
        '9876543210',
        'REGISTRATION',
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(otpService.generateOtp).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    const verifyOtpDto = {
      mobile: '9876543210',
      code: '123456',
    };

    it('should verify valid OTP successfully', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(true);

      const result = await service.verifyOtp(verifyOtpDto);

      expect(result).toEqual({
        success: true,
        message: 'OTP verified successfully',
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        '9876543210',
        '123456',
        'REGISTRATION',
      );
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(false);

      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('createProfile', () => {
    const createProfileDto = {
      mobile: '9876543210',
      email: 'test@example.com',
      name: 'Test User',
      dob: '1995-01-01',
    };

    it('should create user profile with valid data', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.createProfile(createProfileDto);

      expect(result).toHaveProperty('userId', mockUser.id);
      expect(result).toHaveProperty('mobile', '9876543210');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          mobile: '9876543210',
          email: 'test@example.com',
          name: 'Test User',
          dob: new Date('1995-01-01'),
        },
      });
    });

    it('should throw BadRequestException if user is under 18', async () => {
      const underageDto = {
        ...createProfileDto,
        dob: new Date(
          Date.now() - 17 * 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      await expect(service.createProfile(underageDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.createProfile(createProfileDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('setPin', () => {
    const setPinDto = { pin: '5678' };
    const userId = mockUser.id;

    it('should hash and save valid PIN', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        pin: null,
      });
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token');
      mockJwtService.sign.mockReturnValueOnce('refresh-token');
      mockPrismaService.session.create.mockResolvedValue({
        id: 'session-id',
        userId,
        refreshToken: 'refresh-token',
      });

      const result = await service.setPin(userId, setPinDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('user');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { pin: expect.any(String) },
      });
    });

    it('should throw BadRequestException for weak PIN (sequential)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        pin: null,
      });

      await expect(
        service.setPin(userId, { pin: '1234' }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for weak PIN (repeated)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        pin: null,
      });

      await expect(
        service.setPin(userId, { pin: '1111' }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.setPin(userId, setPinDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('loginWithPin', () => {
    const loginDto = {
      mobile: '9876543210',
      pin: '5678',
    };

    it('should return tokens for valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValueOnce('access-token');
      mockJwtService.sign.mockReturnValueOnce('refresh-token');
      mockPrismaService.session.create.mockResolvedValue({
        id: 'session-id',
        userId: mockUser.id,
        refreshToken: 'refresh-token',
      });

      const result = await service.loginWithPin(loginDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.user).toHaveProperty('mobile', '9876543210');
      expect(result.user).not.toHaveProperty('pin');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginWithPin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid PIN', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.loginWithPin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('loginWithOtp', () => {
    const mobile = '9876543210';

    it('should send OTP to existing user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockOtpService.generateOtp.mockResolvedValue(undefined);

      const result = await service.loginWithOtp(mobile);

      expect(result).toEqual({
        success: true,
        message: 'OTP sent to your mobile number',
        expiresIn: 120,
      });
      expect(otpService.generateOtp).toHaveBeenCalledWith(mobile, 'LOGIN');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginWithOtp(mobile)).rejects.toThrow(
        NotFoundException,
      );
      expect(otpService.generateOtp).not.toHaveBeenCalled();
    });
  });

  describe('verifyLoginOtp', () => {
    const verifyDto = {
      mobile: '9876543210',
      code: '123456',
    };

    it('should return tokens for valid OTP', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token');
      mockJwtService.sign.mockReturnValueOnce('refresh-token');
      mockPrismaService.session.create.mockResolvedValue({
        id: 'session-id',
        userId: mockUser.id,
        refreshToken: 'refresh-token',
      });

      const result = await service.verifyLoginOtp(verifyDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toHaveProperty('mobile', '9876543210');
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(false);

      await expect(service.verifyLoginOtp(verifyDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = { refreshToken: 'valid-refresh-token' };

    it('should generate new access token for valid refresh token', async () => {
      const mockSession = {
        id: 'session-id',
        userId: mockUser.id,
        refreshToken: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockJwtService.verify.mockReturnValue({ sub: mockUser.id });
      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-secret',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired session', async () => {
      const expiredSession = {
        id: 'session-id',
        userId: mockUser.id,
        refreshToken: 'valid-refresh-token',
        expiresAt: new Date(Date.now() - 1000),
      };

      mockJwtService.verify.mockReturnValue({ sub: mockUser.id });
      mockPrismaService.session.findUnique.mockResolvedValue(expiredSession);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const userId = mockUser.id;
    const refreshToken = 'refresh-token';

    it('should delete session successfully', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.logout(userId, refreshToken);

      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId, refreshToken },
      });
    });

    it('should return success even if session not found', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.logout(userId, refreshToken);

      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('resetPin', () => {
    const resetDto = {
      mobile: '9876543210',
      code: '123456',
      newPin: '9876',
    };

    it('should reset PIN with valid OTP', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        pin: 'new-hashed-pin',
      });

      const result = await service.resetPin(resetDto);

      expect(result).toEqual({
        success: true,
        message: 'PIN reset successfully',
      });
      expect(otpService.verifyOtp).toHaveBeenCalledWith(
        '9876543210',
        '123456',
        'RESET_PIN',
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { pin: expect.any(String) },
      });
    });

    it('should throw BadRequestException for weak new PIN', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.resetPin({ ...resetDto, newPin: '1234' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(false);

      await expect(service.resetPin(resetDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Helper Methods', () => {
    describe('isWeakPin', () => {
      it('should detect sequential patterns', () => {
        const weakPins = ['1234', '2345', '3456', '9876', '5432'];
        weakPins.forEach((pin) => {
          expect((service as any).isWeakPin(pin)).toBe(true);
        });
      });

      it('should detect repeated digits', () => {
        const weakPins = ['1111', '2222', '5555', '9999'];
        weakPins.forEach((pin) => {
          expect((service as any).isWeakPin(pin)).toBe(true);
        });
      });

      it('should accept strong PINs', () => {
        const strongPins = ['5678', '1379', '2468', '9173'];
        strongPins.forEach((pin) => {
          expect((service as any).isWeakPin(pin)).toBe(false);
        });
      });
    });

    describe('calculateAge', () => {
      it('should calculate correct age', () => {
        const dob = new Date('1995-01-01');
        const age = (service as any).calculateAge(dob);
        expect(age).toBeGreaterThanOrEqual(28);
      });

      it('should handle birthdays not yet occurred this year', () => {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 1);
        futureDate.setFullYear(futureDate.getFullYear() - 20);

        const age = (service as any).calculateAge(futureDate);
        expect(age).toBe(19);
      });
    });
  });
});
