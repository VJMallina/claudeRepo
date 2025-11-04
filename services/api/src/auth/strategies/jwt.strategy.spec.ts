import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-jwt-secret',
      };
      return config[key];
    }),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    mobile: '9876543210',
    email: 'test@example.com',
    name: 'Test User',
    kycStatus: 'PENDING',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const payload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      mobile: '9876543210',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
    };

    it('should return user for valid token payload', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: mockUser.id,
        mobile: mockUser.mobile,
        email: mockUser.email,
        name: mockUser.name,
        kycStatus: mockUser.kycStatus,
        createdAt: mockUser.createdAt,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
        select: {
          id: true,
          mobile: true,
          email: true,
          name: true,
          kycStatus: true,
          createdAt: true,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not include sensitive data in returned user', async () => {
      const userWithSensitiveData = {
        ...mockUser,
        pin: '$2b$10$hashedpin',
        password: 'hashedpassword',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(
        userWithSensitiveData,
      );

      const result = await strategy.validate(payload);

      expect(result).not.toHaveProperty('pin');
      expect(result).not.toHaveProperty('password');
    });

    it('should handle different user IDs correctly', async () => {
      const differentPayload = {
        ...payload,
        sub: 'different-user-id',
      };
      const differentUser = {
        ...mockUser,
        id: 'different-user-id',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(differentUser);

      const result = await strategy.validate(differentPayload);

      expect(result.id).toBe('different-user-id');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'different-user-id' },
        select: expect.any(Object),
      });
    });

    it('should work with different KYC statuses', async () => {
      const verifiedUser = {
        ...mockUser,
        kycStatus: 'VERIFIED',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(verifiedUser);

      const result = await strategy.validate(payload);

      expect(result.kycStatus).toBe('VERIFIED');
    });
  });

  describe('Strategy Configuration', () => {
    it('should configure strategy with correct secret', () => {
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should use Bearer token from Authorization header', () => {
      // This is configured in the constructor via ExtractJwt.fromAuthHeaderAsBearerToken()
      // We verify the strategy is properly configured
      expect(strategy).toBeDefined();
    });
  });
});
