import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findOne: jest.fn(),
    updateProfile: jest.fn(),
    enableBiometric: jest.fn(),
    disableBiometric: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        mobile: '9876543210',
        email: 'test@example.com',
        name: 'Test User',
      };
      return true;
    }),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    mobile: '9876543210',
    email: 'test@example.com',
    name: 'Test User',
    dob: new Date('1995-01-01'),
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

  const mockRequest = {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      mobile: '9876543210',
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile with related data', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(mockRequest.user.id);
    });

    it('should use authenticated user ID from request', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      await controller.getProfile(mockRequest);

      expect(usersService.findOne).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      profilePhoto: 'https://example.com/photo.jpg',
    };

    it('should update user profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockRequest, updateData);

      expect(result).toEqual(updatedUser);
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockRequest.user.id,
        updateData,
      );
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { name: 'New Name' };
      const partiallyUpdatedUser = { ...mockUser, name: 'New Name' };
      mockUsersService.updateProfile.mockResolvedValue(partiallyUpdatedUser);

      const result = await controller.updateProfile(mockRequest, partialUpdate);

      expect(result).toEqual(partiallyUpdatedUser);
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        mockRequest.user.id,
        partialUpdate,
      );
    });
  });

  describe('enableBiometric', () => {
    it('should enable biometric authentication', async () => {
      const userWithBiometric = {
        ...mockUser,
        biometricEnabled: true,
      };
      mockUsersService.enableBiometric.mockResolvedValue(userWithBiometric);

      const result = await controller.enableBiometric(mockRequest);

      expect(result).toEqual(userWithBiometric);
      expect(result.biometricEnabled).toBe(true);
      expect(usersService.enableBiometric).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
    });
  });

  describe('disableBiometric', () => {
    it('should disable biometric authentication', async () => {
      const userWithoutBiometric = {
        ...mockUser,
        biometricEnabled: false,
      };
      mockUsersService.disableBiometric.mockResolvedValue(
        userWithoutBiometric,
      );

      const result = await controller.disableBiometric(mockRequest);

      expect(result).toEqual(userWithoutBiometric);
      expect(result.biometricEnabled).toBe(false);
      expect(usersService.disableBiometric).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
    });
  });

  describe('Guard Protection', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UsersController,
      );
      expect(guards).toBeDefined();
    });
  });
});
