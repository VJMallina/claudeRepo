import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthStore } from '../authStore';
import authService from '@/services/auth.service';

jest.mock('@/services/auth.service');

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser(null);
      result.current.setLoading(false);
      result.current.setError(null);
    });
    jest.clearAllMocks();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('setUser', () => {
    it('should set user and update isAuthenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = {
        id: 'user-1',
        mobile: '9876543210',
        name: 'Test User',
        email: null,
        kycLevel: 0,
        kycStatus: 'PENDING' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear user and update isAuthenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-1',
          mobile: '9876543210',
          name: 'Test User',
          email: null,
          kycLevel: 0,
          kycStatus: 'PENDING' as const,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      };

      (authService.verifyOtp as jest.Mock).mockResolvedValue(mockResponse);

      await act(async () => {
        await result.current.login('9876543210', '123456');
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle login error', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockError = {
        response: {
          data: {
            message: 'Invalid OTP',
          },
        },
      };

      (authService.verifyOtp as jest.Mock).mockRejectedValue(mockError);

      await act(async () => {
        try {
          await result.current.login('9876543210', 'wrong');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Invalid OTP');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set initial user
      const mockUser = {
        id: 'user-1',
        mobile: '9876543210',
        name: 'Test User',
        email: null,
        kycLevel: 0,
        kycStatus: 'PENDING' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should clear state even if logout fails', async () => {
      const { result } = renderHook(() => useAuthStore());

      (authService.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('loadUser', () => {
    it('should load user if authenticated', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = {
        id: 'user-1',
        mobile: '9876543210',
        name: 'Test User',
        email: null,
        kycLevel: 0,
        kycStatus: 'PENDING' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (authService.isAuthenticated as jest.Mock).mockResolvedValue(true);
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      await act(async () => {
        await result.current.loadUser();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should not load user if not authenticated', async () => {
      const { result } = renderHook(() => useAuthStore());

      (authService.isAuthenticated as jest.Mock).mockResolvedValue(false);

      await act(async () => {
        await result.current.loadUser();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle load user error', async () => {
      const { result } = renderHook(() => useAuthStore());

      (authService.isAuthenticated as jest.Mock).mockResolvedValue(true);
      (authService.getCurrentUser as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await act(async () => {
        await result.current.loadUser();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
