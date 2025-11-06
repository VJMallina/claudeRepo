import ProfileService, {
  UserProfile,
  BankAccount,
  AddBankAccountRequest,
  ChangeMobileRequest,
} from '../profile.service';
import apiService from '../api.service';

// Mock dependencies
jest.mock('../api.service');

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile: UserProfile = {
        userId: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        mobile: '9876543210',
        dateOfBirth: '1990-01-15',
        address: '123 Main St, Mumbai',
        profilePhotoUrl: 'https://example.com/photo.jpg',
        kycLevel: 'FULL',
        kycStatus: 'VERIFIED',
        createdAt: '2023-01-01',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockProfile);

      const result = await ProfileService.getProfile();

      expect(result).toEqual(mockProfile);
      expect(apiService.get).toHaveBeenCalledWith('/users/profile');
    });

    it('should handle API errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(ProfileService.getProfile()).rejects.toThrow('Network error');
    });
  });

  describe('updateProfile', () => {
    it('should update profile with all fields', async () => {
      const updateData = {
        fullName: 'John Updated Doe',
        email: 'john.updated@example.com',
        dateOfBirth: '1990-01-15',
        address: '456 New St, Mumbai',
      };

      const mockUpdatedProfile: UserProfile = {
        userId: 'user123',
        ...updateData,
        mobile: '9876543210',
        kycLevel: 'FULL',
        kycStatus: 'VERIFIED',
        createdAt: '2023-01-01',
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockUpdatedProfile);

      const result = await ProfileService.updateProfile(updateData);

      expect(result).toEqual(mockUpdatedProfile);
      expect(apiService.put).toHaveBeenCalledWith('/users/profile', updateData);
    });

    it('should update profile with partial fields', async () => {
      const updateData = {
        fullName: 'John Updated',
      };

      const mockUpdatedProfile: UserProfile = {
        userId: 'user123',
        fullName: 'John Updated',
        email: 'john@example.com',
        mobile: '9876543210',
        kycLevel: 'FULL',
        kycStatus: 'VERIFIED',
        createdAt: '2023-01-01',
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockUpdatedProfile);

      const result = await ProfileService.updateProfile(updateData);

      expect(result.fullName).toBe('John Updated');
    });

    it('should handle update errors', async () => {
      (apiService.put as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(
        ProfileService.updateProfile({ fullName: 'John' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('uploadProfilePhoto', () => {
    it('should upload profile photo successfully', async () => {
      const photoUri = 'file:///path/to/photo.jpg';
      const mockResponse = {
        profilePhotoUrl: 'https://storage.example.com/profile_123.jpg',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.uploadProfilePhoto(photoUri);

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        '/users/profile/photo',
        expect.any(Object),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should handle upload errors', async () => {
      const photoUri = 'file:///path/to/photo.jpg';

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      await expect(ProfileService.uploadProfilePhoto(photoUri)).rejects.toThrow('Upload failed');
    });
  });

  describe('requestMobileChange', () => {
    it('should request mobile number change with OTP', async () => {
      const newMobile = '9999888877';
      const mockResponse = {
        success: true,
        message: 'OTP sent to new mobile number',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.requestMobileChange(newMobile);

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/users/change-mobile/request', {
        newMobile,
      });
    });

    it('should handle invalid mobile number', async () => {
      const newMobile = 'invalid';

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid mobile number'));

      await expect(ProfileService.requestMobileChange(newMobile)).rejects.toThrow(
        'Invalid mobile number'
      );
    });
  });

  describe('changeMobile', () => {
    it('should change mobile number with valid OTP', async () => {
      const data: ChangeMobileRequest = {
        newMobile: '9999888877',
        otp: '123456',
      };

      const mockResponse = {
        success: true,
        message: 'Mobile number changed successfully',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.changeMobile(data);

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/users/change-mobile/verify', data);
    });

    it('should handle invalid OTP', async () => {
      const data: ChangeMobileRequest = {
        newMobile: '9999888877',
        otp: '000000',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid OTP'));

      await expect(ProfileService.changeMobile(data)).rejects.toThrow('Invalid OTP');
    });
  });

  describe('getBankAccounts', () => {
    it('should fetch all bank accounts', async () => {
      const mockAccounts: BankAccount[] = [
        {
          id: 'bank1',
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          accountHolderName: 'John Doe',
          isPrimary: true,
          verified: true,
          createdAt: '2023-01-01',
        },
        {
          id: 'bank2',
          accountNumber: '0987654321',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          accountHolderName: 'John Doe',
          isPrimary: false,
          verified: true,
          createdAt: '2023-02-01',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAccounts);

      const result = await ProfileService.getBankAccounts();

      expect(result).toEqual(mockAccounts);
      expect(result).toHaveLength(2);
      expect(apiService.get).toHaveBeenCalledWith('/users/bank-accounts');
    });

    it('should return empty array when no accounts', async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await ProfileService.getBankAccounts();

      expect(result).toEqual([]);
    });
  });

  describe('addBankAccount', () => {
    it('should add new bank account', async () => {
      const data: AddBankAccountRequest = {
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
      };

      const mockAccount: BankAccount = {
        id: 'bank1',
        ...data,
        bankName: 'State Bank of India',
        isPrimary: false,
        verified: false,
        createdAt: new Date().toISOString(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockAccount);

      const result = await ProfileService.addBankAccount(data);

      expect(result).toEqual(mockAccount);
      expect(apiService.post).toHaveBeenCalledWith('/users/bank-accounts', data);
    });

    it('should handle invalid IFSC code', async () => {
      const data: AddBankAccountRequest = {
        accountNumber: '1234567890',
        ifscCode: 'INVALID',
        accountHolderName: 'John Doe',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid IFSC code'));

      await expect(ProfileService.addBankAccount(data)).rejects.toThrow('Invalid IFSC code');
    });

    it('should handle duplicate account', async () => {
      const data: AddBankAccountRequest = {
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Account already exists'));

      await expect(ProfileService.addBankAccount(data)).rejects.toThrow('Account already exists');
    });
  });

  describe('deleteBankAccount', () => {
    it('should delete bank account successfully', async () => {
      const accountId = 'bank1';
      const mockResponse = { success: true };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.deleteBankAccount(accountId);

      expect(result).toEqual(mockResponse);
      expect(apiService.delete).toHaveBeenCalledWith(`/users/bank-accounts/${accountId}`);
    });

    it('should handle deletion of non-existent account', async () => {
      const accountId = 'invalid_id';

      (apiService.delete as jest.Mock).mockRejectedValue(new Error('Account not found'));

      await expect(ProfileService.deleteBankAccount(accountId)).rejects.toThrow(
        'Account not found'
      );
    });

    it('should prevent deletion of primary account', async () => {
      const accountId = 'bank1';

      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error('Cannot delete primary account')
      );

      await expect(ProfileService.deleteBankAccount(accountId)).rejects.toThrow(
        'Cannot delete primary account'
      );
    });
  });

  describe('setPrimaryBankAccount', () => {
    it('should set account as primary', async () => {
      const accountId = 'bank2';
      const mockResponse = { success: true };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.setPrimaryBankAccount(accountId);

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        `/users/bank-accounts/${accountId}/set-primary`
      );
    });

    it('should handle invalid account ID', async () => {
      const accountId = 'invalid_id';

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Account not found'));

      await expect(ProfileService.setPrimaryBankAccount(accountId)).rejects.toThrow(
        'Account not found'
      );
    });
  });

  describe('getStatements', () => {
    it('should fetch statements with date range', async () => {
      const fromDate = '2023-01-01';
      const toDate = '2023-12-31';

      const mockStatements = [
        {
          id: 'stmt1',
          date: '2023-06-15',
          type: 'CREDIT',
          amount: 1000,
          balance: 5000,
        },
        {
          id: 'stmt2',
          date: '2023-06-20',
          type: 'DEBIT',
          amount: 500,
          balance: 4500,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockStatements);

      const result = await ProfileService.getStatements(fromDate, toDate);

      expect(result).toEqual(mockStatements);
      expect(apiService.get).toHaveBeenCalledWith(
        `/users/statements?from=${fromDate}&to=${toDate}`
      );
    });

    it('should handle empty statements', async () => {
      const fromDate = '2023-01-01';
      const toDate = '2023-01-31';

      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await ProfileService.getStatements(fromDate, toDate);

      expect(result).toEqual([]);
    });
  });

  describe('downloadStatement', () => {
    it('should download statement as PDF', async () => {
      const fromDate = '2023-01-01';
      const toDate = '2023-12-31';
      const format = 'PDF';

      const mockResponse = {
        downloadUrl: 'https://storage.example.com/statement_123.pdf',
        expiresAt: '2023-12-31T23:59:59Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.downloadStatement(fromDate, toDate, format);

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/users/statements/download', {
        fromDate,
        toDate,
        format,
      });
    });

    it('should download statement as Excel', async () => {
      const fromDate = '2023-01-01';
      const toDate = '2023-12-31';
      const format = 'EXCEL';

      const mockResponse = {
        downloadUrl: 'https://storage.example.com/statement_123.xlsx',
        expiresAt: '2023-12-31T23:59:59Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.downloadStatement(fromDate, toDate, format);

      expect(result.downloadUrl).toContain('.xlsx');
    });

    it('should download statement as CSV', async () => {
      const fromDate = '2023-01-01';
      const toDate = '2023-12-31';
      const format = 'CSV';

      const mockResponse = {
        downloadUrl: 'https://storage.example.com/statement_123.csv',
        expiresAt: '2023-12-31T23:59:59Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.downloadStatement(fromDate, toDate, format);

      expect(result.downloadUrl).toContain('.csv');
    });
  });

  describe('exportUserData', () => {
    it('should export user data successfully', async () => {
      const mockResponse = {
        downloadUrl: 'https://storage.example.com/user_data_123.zip',
        expiresAt: '2023-12-31T23:59:59Z',
        fileSize: 1024000,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.exportUserData();

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/users/export-data');
    });

    it('should handle export errors', async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Export failed'));

      await expect(ProfileService.exportUserData()).rejects.toThrow('Export failed');
    });
  });

  describe('deleteAccount', () => {
    it('should delete account with reason', async () => {
      const reason = 'No longer need the service';
      const mockResponse = {
        success: true,
        message: 'Account deletion scheduled',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.deleteAccount(reason);

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/users/delete-account', { reason });
    });

    it('should delete account without reason', async () => {
      const mockResponse = {
        success: true,
        message: 'Account deletion scheduled',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ProfileService.deleteAccount();

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/users/delete-account', {});
    });

    it('should handle deletion errors', async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error('Cannot delete account with pending balance')
      );

      await expect(ProfileService.deleteAccount()).rejects.toThrow(
        'Cannot delete account with pending balance'
      );
    });
  });

  describe('Complete Profile Management Flow', () => {
    it('should complete full profile update flow', async () => {
      // Step 1: Get current profile
      const mockProfile: UserProfile = {
        userId: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        mobile: '9876543210',
        kycLevel: 'FULL',
        kycStatus: 'VERIFIED',
        createdAt: '2023-01-01',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockProfile);
      const profile = await ProfileService.getProfile();
      expect(profile.fullName).toBe('John Doe');

      // Step 2: Update profile
      const updateData = {
        fullName: 'John Updated Doe',
        address: '123 New Address',
      };

      const mockUpdated: UserProfile = {
        ...mockProfile,
        ...updateData,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockUpdated);
      const updated = await ProfileService.updateProfile(updateData);
      expect(updated.fullName).toBe('John Updated Doe');

      // Step 3: Upload profile photo
      const mockPhotoResponse = {
        profilePhotoUrl: 'https://storage.example.com/photo.jpg',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockPhotoResponse);
      const photoResult = await ProfileService.uploadProfilePhoto('file:///photo.jpg');
      expect(photoResult.profilePhotoUrl).toBeDefined();
    });

    it('should complete bank account management flow', async () => {
      // Step 1: Get existing accounts
      const mockAccounts: BankAccount[] = [
        {
          id: 'bank1',
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          accountHolderName: 'John Doe',
          isPrimary: true,
          verified: true,
          createdAt: '2023-01-01',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAccounts);
      const accounts = await ProfileService.getBankAccounts();
      expect(accounts).toHaveLength(1);

      // Step 2: Add new account
      const newAccountData: AddBankAccountRequest = {
        accountNumber: '0987654321',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'John Doe',
      };

      const mockNewAccount: BankAccount = {
        id: 'bank2',
        ...newAccountData,
        bankName: 'HDFC Bank',
        isPrimary: false,
        verified: false,
        createdAt: new Date().toISOString(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockNewAccount);
      const newAccount = await ProfileService.addBankAccount(newAccountData);
      expect(newAccount.id).toBe('bank2');

      // Step 3: Set new account as primary
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });
      const setPrimary = await ProfileService.setPrimaryBankAccount('bank2');
      expect(setPrimary.success).toBe(true);
    });

    it('should complete mobile change flow', async () => {
      // Step 1: Request OTP
      const mockOtpResponse = {
        success: true,
        message: 'OTP sent',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockOtpResponse);
      const otpResult = await ProfileService.requestMobileChange('9999888877');
      expect(otpResult.success).toBe(true);

      // Step 2: Verify OTP and change mobile
      const mockChangeResponse = {
        success: true,
        message: 'Mobile changed successfully',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockChangeResponse);
      const changeResult = await ProfileService.changeMobile({
        newMobile: '9999888877',
        otp: '123456',
      });
      expect(changeResult.success).toBe(true);
    });
  });
});
