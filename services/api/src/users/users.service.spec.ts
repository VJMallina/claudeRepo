import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    mobile: '9876543210',
    email: 'test@example.com',
    name: 'Test User',
    dob: new Date('1995-01-01'),
    pin: '$2b$10$hashedpin',
    profilePhoto: null,
    kycStatus: 'PENDING',
    biometricEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    savingsConfig: {
      id: 'config-id',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      autoSaveEnabled: true,
      savingsPercentage: 10,
    },
    savingsWallet: {
      id: 'wallet-id',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      balance: 5000,
    },
    kycDocuments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user without PIN field', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).not.toHaveProperty('pin');
      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('mobile', mockUser.mobile);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('name', mockUser.name);
      expect(result).toHaveProperty('savingsConfig');
      expect(result).toHaveProperty('savingsWallet');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        include: {
          savingsConfig: true,
          savingsWallet: true,
          kycDocuments: true,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should include related data (savingsConfig, savingsWallet, kycDocuments)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result.savingsConfig).toBeDefined();
      expect(result.savingsWallet).toBeDefined();
      expect(result.kycDocuments).toBeDefined();
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      profilePhoto: 'https://example.com/photo.jpg',
    };

    it('should update user profile successfully', async () => {
      const updatedUser = {
        ...mockUser,
        ...updateData,
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(mockUser.id, updateData);

      expect(result).toHaveProperty('name', 'Updated Name');
      expect(result).toHaveProperty('email', 'updated@example.com');
      expect(result).not.toHaveProperty('pin');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateData,
        select: {
          id: true,
          mobile: true,
          email: true,
          name: true,
          dob: true,
          profilePhoto: true,
          kycStatus: true,
          biometricEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { name: 'New Name' };
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        name: 'New Name',
      });

      await service.updateProfile(mockUser.id, partialUpdate);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: partialUpdate,
        select: expect.any(Object),
      });
    });

    it('should not expose PIN in response', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await service.updateProfile(mockUser.id, updateData);

      expect(result).not.toHaveProperty('pin');
    });
  });

  describe('enableBiometric', () => {
    it('should enable biometric authentication', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        biometricEnabled: true,
      });

      const result = await service.enableBiometric(mockUser.id);

      expect(result).toHaveProperty('biometricEnabled', true);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { biometricEnabled: true },
        select: {
          id: true,
          mobile: true,
          email: true,
          name: true,
          dob: true,
          profilePhoto: true,
          kycStatus: true,
          biometricEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should not expose PIN in response', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        biometricEnabled: true,
      });

      const result = await service.enableBiometric(mockUser.id);

      expect(result).not.toHaveProperty('pin');
    });
  });

  describe('disableBiometric', () => {
    it('should disable biometric authentication', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        biometricEnabled: false,
      });

      const result = await service.disableBiometric(mockUser.id);

      expect(result).toHaveProperty('biometricEnabled', false);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { biometricEnabled: false },
        select: {
          id: true,
          mobile: true,
          email: true,
          name: true,
          dob: true,
          profilePhoto: true,
          kycStatus: true,
          biometricEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty update data', async () => {
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.updateProfile(mockUser.id, {});

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {},
        select: expect.any(Object),
      });
    });

    it('should handle null profilePhoto', async () => {
      const userWithoutPhoto = { ...mockUser, profilePhoto: null };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPhoto);

      const result = await service.findOne(mockUser.id);

      expect(result).toHaveProperty('profilePhoto', null);
    });
  });
});
