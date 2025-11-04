import authService from '../auth.service';
import apiService from '../api.service';

jest.mock('../api.service');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user with mobile number', async () => {
      const mockResponse = {
        message: 'OTP sent successfully',
        userId: 'user-123',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.register({ mobile: '9876543210' });

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/auth/register', {
        mobile: '9876543210',
      });
    });

    it('should handle registration errors', async () => {
      const mockError = new Error('Invalid mobile number');
      (apiService.post as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.register({ mobile: 'invalid' })).rejects.toThrow(
        'Invalid mobile number'
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return auth response', async () => {
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-123',
          mobile: '9876543210',
          name: 'Test User',
          email: null,
          kycLevel: 0,
          kycStatus: 'PENDING',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);
      (apiService.setTokens as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.verifyOtp({
        mobile: '9876543210',
        otp: '123456',
      });

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/auth/verify-otp', {
        mobile: '9876543210',
        otp: '123456',
      });
      expect(apiService.setTokens).toHaveBeenCalledWith(
        'access-token',
        'refresh-token'
      );
    });

    it('should handle invalid OTP', async () => {
      const mockError = new Error('Invalid OTP');
      (apiService.post as jest.Mock).mockRejectedValue(mockError);

      await expect(
        authService.verifyOtp({ mobile: '9876543210', otp: 'wrong' })
      ).rejects.toThrow('Invalid OTP');
    });
  });

  describe('resendOtp', () => {
    it('should resend OTP', async () => {
      const mockResponse = { message: 'OTP resent successfully' };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.resendOtp('9876543210');

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/auth/resend-otp', {
        mobile: '9876543210',
      });
    });
  });

  describe('logout', () => {
    it('should logout user and clear tokens', async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});
      (apiService.clearTokens as jest.Mock).mockResolvedValue(undefined);

      await authService.logout();

      expect(apiService.post).toHaveBeenCalledWith('/auth/logout');
      expect(apiService.clearTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if API call fails', async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));
      (apiService.clearTokens as jest.Mock).mockResolvedValue(undefined);

      await authService.logout();

      expect(apiService.clearTokens).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should check if user is authenticated', async () => {
      (apiService.isAuthenticated as jest.Mock).mockResolvedValue(true);

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
      expect(apiService.isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user profile', async () => {
      const mockUser = {
        id: 'user-123',
        mobile: '9876543210',
        name: 'Test User',
        email: 'test@example.com',
        kycLevel: 1,
        kycStatus: 'VERIFIED',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(apiService.get).toHaveBeenCalledWith('/users/profile');
    });
  });
});
