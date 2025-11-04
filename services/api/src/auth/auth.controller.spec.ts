import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    verifyOtp: jest.fn(),
    createProfile: jest.fn(),
    setPin: jest.fn(),
    loginWithPin: jest.fn(),
    loginWithOtp: jest.fn(),
    verifyLoginOtp: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    resetPin: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = { mobile: '9876543210' };

    it('should call authService.register with correct data', async () => {
      const expectedResponse = {
        success: true,
        message: 'OTP sent to your mobile number',
        expiresIn: 120,
      };
      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('verifyOtp', () => {
    const verifyOtpDto = {
      mobile: '9876543210',
      code: '123456',
    };

    it('should call authService.verifyOtp with correct data', async () => {
      const expectedResponse = {
        success: true,
        message: 'OTP verified successfully',
      };
      mockAuthService.verifyOtp.mockResolvedValue(expectedResponse);

      const result = await controller.verifyOtp(verifyOtpDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.verifyOtp).toHaveBeenCalledWith(verifyOtpDto);
    });
  });

  describe('createProfile', () => {
    const createProfileDto = {
      mobile: '9876543210',
      email: 'test@example.com',
      name: 'Test User',
      dob: '1995-01-01',
    };

    it('should call authService.createProfile with correct data', async () => {
      const expectedResponse = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        mobile: '9876543210',
        email: 'test@example.com',
        name: 'Test User',
      };
      mockAuthService.createProfile.mockResolvedValue(expectedResponse);

      const result = await controller.createProfile(createProfileDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.createProfile).toHaveBeenCalledWith(createProfileDto);
    });
  });

  describe('setPin', () => {
    const setPinDto = { userId: '123', pin: '5678' };

    it('should call authService.setPin with correct data', async () => {
      const expectedResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: '123',
          mobile: '9876543210',
          email: 'test@example.com',
          name: 'Test User',
        },
      };
      mockAuthService.setPin.mockResolvedValue(expectedResponse);

      const result = await controller.setPin(setPinDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.setPin).toHaveBeenCalledWith('123', { pin: '5678' });
    });
  });

  describe('loginWithPin', () => {
    const loginDto = {
      mobile: '9876543210',
      pin: '5678',
    };

    it('should call authService.loginWithPin with correct data', async () => {
      const expectedResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: '123',
          mobile: '9876543210',
          email: 'test@example.com',
          name: 'Test User',
        },
      };
      mockAuthService.loginWithPin.mockResolvedValue(expectedResponse);

      const result = await controller.loginWithPin(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.loginWithPin).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('loginWithOtp', () => {
    const loginOtpDto = { mobile: '9876543210' };

    it('should call authService.loginWithOtp with mobile', async () => {
      const expectedResponse = {
        success: true,
        message: 'OTP sent to your mobile number',
        expiresIn: 120,
      };
      mockAuthService.loginWithOtp.mockResolvedValue(expectedResponse);

      const result = await controller.loginWithOtp(loginOtpDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.loginWithOtp).toHaveBeenCalledWith('9876543210');
    });
  });

  describe('verifyLoginOtp', () => {
    const verifyDto = {
      mobile: '9876543210',
      code: '123456',
    };

    it('should call authService.verifyLoginOtp with correct data', async () => {
      const expectedResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: '123',
          mobile: '9876543210',
          email: 'test@example.com',
          name: 'Test User',
        },
      };
      mockAuthService.verifyLoginOtp.mockResolvedValue(expectedResponse);

      const result = await controller.verifyLoginOtp(verifyDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.verifyLoginOtp).toHaveBeenCalledWith(verifyDto);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = { refreshToken: 'old-refresh-token' };

    it('should call authService.refreshToken with correct data', async () => {
      const expectedResponse = {
        accessToken: 'new-access-token',
      };
      mockAuthService.refreshToken.mockResolvedValue(expectedResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('logout', () => {
    const mockRequest = {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        mobile: '9876543210',
        email: 'test@example.com',
        name: 'Test User',
      },
    };
    const logoutBody = { refreshToken: 'refresh-token' };

    it('should call authService.logout with user ID and refresh token', async () => {
      const expectedResponse = {
        success: true,
        message: 'Logged out successfully',
      };
      mockAuthService.logout.mockResolvedValue(expectedResponse);

      const result = await controller.logout(mockRequest, logoutBody);

      expect(result).toEqual(expectedResponse);
      expect(authService.logout).toHaveBeenCalledWith(
        mockRequest.user.id,
        'refresh-token',
      );
    });
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        mobile: '9876543210',
        email: 'test@example.com',
        name: 'Test User',
        kycStatus: 'PENDING',
      },
    };

    it('should return user from request object', async () => {
      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });
  });

  describe('resetPin', () => {
    const resetPinDto = {
      mobile: '9876543210',
      code: '123456',
      newPin: '9876',
    };

    it('should call authService.resetPin with correct data', async () => {
      const expectedResponse = {
        success: true,
        message: 'PIN reset successfully',
      };
      mockAuthService.resetPin.mockResolvedValue(expectedResponse);

      const result = await controller.resetPin(resetPinDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.resetPin).toHaveBeenCalledWith(resetPinDto);
    });
  });
});
