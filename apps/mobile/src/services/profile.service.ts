import apiService from './api.service';

/**
 * Profile Management Service
 *
 * Handles user profile operations
 * Features:
 * - Get/update profile information
 * - Change mobile number
 * - Update email
 * - Profile photo management
 * - Bank account management
 * - Document management
 * - Statement downloads
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  dob: string;
  profilePhoto?: string;
  kycStatus: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
  kycLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  dob?: string;
  profilePhoto?: string;
}

export interface ChangeMobileRequest {
  newMobile: string;
  otp: string;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  branchName?: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AddBankAccountRequest {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

class ProfileService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      return await apiService.get<UserProfile>('/users/profile');
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Update profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      return await apiService.put<UserProfile>('/users/profile', data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Update profile photo
   */
  async updateProfilePhoto(photoUri: string): Promise<{ profilePhoto: string }> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `profile_${Date.now()}.jpg`,
      } as any);

      return await apiService.post('/users/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    }
  }

  /**
   * Request mobile number change OTP
   */
  async requestMobileChangeOtp(newMobile: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiService.post('/users/change-mobile/request', { newMobile });
    } catch (error) {
      console.error('Error requesting mobile change OTP:', error);
      throw error;
    }
  }

  /**
   * Verify and change mobile number
   */
  async changeMobile(data: ChangeMobileRequest): Promise<{ success: boolean; message: string }> {
    try {
      return await apiService.post('/users/change-mobile/verify', data);
    } catch (error) {
      console.error('Error changing mobile:', error);
      throw error;
    }
  }

  /**
   * Get bank accounts
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    try {
      return await apiService.get<BankAccount[]>('/users/bank-accounts');
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      throw error;
    }
  }

  /**
   * Add bank account
   */
  async addBankAccount(data: AddBankAccountRequest): Promise<BankAccount> {
    try {
      return await apiService.post<BankAccount>('/users/bank-accounts', data);
    } catch (error) {
      console.error('Error adding bank account:', error);
      throw error;
    }
  }

  /**
   * Delete bank account
   */
  async deleteBankAccount(accountId: string): Promise<{ success: boolean }> {
    try {
      return await apiService.delete(`/users/bank-accounts/${accountId}`);
    } catch (error) {
      console.error('Error deleting bank account:', error);
      throw error;
    }
  }

  /**
   * Set primary bank account
   */
  async setPrimaryBankAccount(accountId: string): Promise<{ success: boolean }> {
    try {
      return await apiService.post(`/users/bank-accounts/${accountId}/set-primary`);
    } catch (error) {
      console.error('Error setting primary bank account:', error);
      throw error;
    }
  }

  /**
   * Download account statement
   */
  async downloadStatement(month: number, year: number): Promise<string> {
    try {
      const response = await apiService.get(
        `/users/statements/download?month=${month}&year=${year}`,
        {
          responseType: 'blob',
        }
      );

      // Return download URL or blob
      return response;
    } catch (error) {
      console.error('Error downloading statement:', error);
      throw error;
    }
  }

  /**
   * Get statement history
   */
  async getStatementHistory(): Promise<Array<{
    id: string;
    month: number;
    year: number;
    downloadUrl: string;
    createdAt: string;
  }>> {
    try {
      return await apiService.get('/users/statements/history');
    } catch (error) {
      console.error('Error fetching statement history:', error);
      throw error;
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(pin: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiService.post('/users/delete-account', { pin });
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  /**
   * Export user data (GDPR)
   */
  async exportUserData(): Promise<string> {
    try {
      const response = await apiService.get('/users/export-data', {
        responseType: 'blob',
      });

      return response;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
}

export default new ProfileService();
