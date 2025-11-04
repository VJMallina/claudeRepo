import apiService from './api.service';
import {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  AuthResponse,
} from '@/types/api.types';

class AuthService {
  /**
   * Register a new user with mobile number
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiService.post<RegisterResponse>('/auth/register', data);
  }

  /**
   * Verify OTP and complete login
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/verify-otp', data);

    // Store tokens
    await apiService.setTokens(response.accessToken, response.refreshToken);

    return response;
  }

  /**
   * Resend OTP
   */
  async resendOtp(mobile: string): Promise<{ message: string }> {
    return apiService.post('/auth/resend-otp', { mobile });
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, clear local tokens
      console.error('Logout API failed:', error);
    } finally {
      await apiService.clearTokens();
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return apiService.isAuthenticated();
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return apiService.get('/users/profile');
  }
}

export default new AuthService();
