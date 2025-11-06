import BankAccountService from '../bank-account.service';
import apiService from '../api.service';
import {
  BankAccount,
  AddBankAccountRequest,
  VerifyBankAccountRequest,
} from '@/types/api.types';

// Mock dependencies
jest.mock('../api.service');

describe('BankAccountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBankAccounts', () => {
    it('should fetch all bank accounts', async () => {
      const mockAccounts: BankAccount[] = [
        {
          id: 'acc1',
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          accountHolderName: 'John Doe',
          bankName: 'State Bank of India',
          isPrimary: true,
          isVerified: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: 'acc2',
          accountNumber: '0987654321',
          ifscCode: 'HDFC0001234',
          accountHolderName: 'John Doe',
          bankName: 'HDFC Bank',
          isPrimary: false,
          isVerified: false,
          createdAt: '2023-02-01T00:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAccounts);

      const result = await BankAccountService.getBankAccounts();

      expect(result).toHaveLength(2);
      expect(result[0].isPrimary).toBe(true);
      expect(result[1].isVerified).toBe(false);
      expect(apiService.get).toHaveBeenCalledWith('/bank-accounts');
    });

    it('should return empty array when no accounts', async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await BankAccountService.getBankAccounts();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(BankAccountService.getBankAccounts()).rejects.toThrow('Network error');
    });
  });

  describe('getBankAccountById', () => {
    it('should fetch specific bank account', async () => {
      const mockAccount: BankAccount = {
        id: 'acc1',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
        bankName: 'State Bank of India',
        isPrimary: true,
        isVerified: true,
        createdAt: '2023-01-01T00:00:00Z',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockAccount);

      const result = await BankAccountService.getBankAccountById('acc1');

      expect(result).toEqual(mockAccount);
      expect(result.id).toBe('acc1');
      expect(apiService.get).toHaveBeenCalledWith('/bank-accounts/acc1');
    });

    it('should handle non-existent account', async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error('Account not found'));

      await expect(BankAccountService.getBankAccountById('invalid')).rejects.toThrow(
        'Account not found'
      );
    });
  });

  describe('addBankAccount', () => {
    it('should add new bank account successfully', async () => {
      const data: AddBankAccountRequest = {
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
      };

      const mockResponse: BankAccount = {
        id: 'acc1',
        ...data,
        bankName: 'State Bank of India',
        isPrimary: false,
        isVerified: false,
        createdAt: '2023-12-01T10:00:00Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await BankAccountService.addBankAccount(data);

      expect(result).toEqual(mockResponse);
      expect(result.accountNumber).toBe('1234567890');
      expect(result.bankName).toBe('State Bank of India');
      expect(result.isVerified).toBe(false);
      expect(apiService.post).toHaveBeenCalledWith('/bank-accounts', data);
    });

    it('should handle invalid IFSC code', async () => {
      const data: AddBankAccountRequest = {
        accountNumber: '1234567890',
        ifscCode: 'INVALID',
        accountHolderName: 'John Doe',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid IFSC code'));

      await expect(BankAccountService.addBankAccount(data)).rejects.toThrow('Invalid IFSC code');
    });

    it('should handle duplicate account', async () => {
      const data: AddBankAccountRequest = {
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Account already exists'));

      await expect(BankAccountService.addBankAccount(data)).rejects.toThrow(
        'Account already exists'
      );
    });

    it('should handle invalid account number', async () => {
      const data: AddBankAccountRequest = {
        accountNumber: 'invalid',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid account number'));

      await expect(BankAccountService.addBankAccount(data)).rejects.toThrow(
        'Invalid account number'
      );
    });
  });

  describe('verifyBankAccount', () => {
    it('should verify bank account with penny drop', async () => {
      const data: VerifyBankAccountRequest = {
        accountId: 'acc1',
        verificationMethod: 'PENNY_DROP',
      };

      const mockResponse: BankAccount = {
        id: 'acc1',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
        bankName: 'State Bank of India',
        isPrimary: false,
        isVerified: true,
        createdAt: '2023-12-01T10:00:00Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await BankAccountService.verifyBankAccount(data);

      expect(result.isVerified).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/bank-accounts/verify', data);
    });

    it('should verify bank account with manual verification', async () => {
      const data: VerifyBankAccountRequest = {
        accountId: 'acc1',
        verificationMethod: 'MANUAL',
        verificationDocumentUrl: 'https://example.com/statement.pdf',
      };

      const mockResponse: BankAccount = {
        id: 'acc1',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
        bankName: 'State Bank of India',
        isPrimary: false,
        isVerified: true,
        createdAt: '2023-12-01T10:00:00Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await BankAccountService.verifyBankAccount(data);

      expect(result.isVerified).toBe(true);
    });

    it('should handle verification failure', async () => {
      const data: VerifyBankAccountRequest = {
        accountId: 'acc1',
        verificationMethod: 'PENNY_DROP',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Verification failed'));

      await expect(BankAccountService.verifyBankAccount(data)).rejects.toThrow(
        'Verification failed'
      );
    });
  });

  describe('setPrimaryAccount', () => {
    it('should set account as primary', async () => {
      const mockResponse: BankAccount = {
        id: 'acc2',
        accountNumber: '0987654321',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'John Doe',
        bankName: 'HDFC Bank',
        isPrimary: true,
        isVerified: true,
        createdAt: '2023-02-01T00:00:00Z',
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await BankAccountService.setPrimaryAccount('acc2');

      expect(result.isPrimary).toBe(true);
      expect(result.id).toBe('acc2');
      expect(apiService.patch).toHaveBeenCalledWith('/bank-accounts/acc2/set-primary', {});
    });

    it('should handle unverified account', async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(
        new Error('Cannot set unverified account as primary')
      );

      await expect(BankAccountService.setPrimaryAccount('acc2')).rejects.toThrow(
        'Cannot set unverified account as primary'
      );
    });

    it('should handle non-existent account', async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(new Error('Account not found'));

      await expect(BankAccountService.setPrimaryAccount('invalid')).rejects.toThrow(
        'Account not found'
      );
    });
  });

  describe('deleteBankAccount', () => {
    it('should delete bank account successfully', async () => {
      const mockResponse = {
        message: 'Bank account deleted successfully',
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await BankAccountService.deleteBankAccount('acc2');

      expect(result.message).toBe('Bank account deleted successfully');
      expect(apiService.delete).toHaveBeenCalledWith('/bank-accounts/acc2');
    });

    it('should prevent deletion of primary account', async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error('Cannot delete primary account')
      );

      await expect(BankAccountService.deleteBankAccount('acc1')).rejects.toThrow(
        'Cannot delete primary account'
      );
    });

    it('should prevent deletion when account has pending transactions', async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error('Cannot delete account with pending transactions')
      );

      await expect(BankAccountService.deleteBankAccount('acc2')).rejects.toThrow(
        'pending transactions'
      );
    });

    it('should handle non-existent account', async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(new Error('Account not found'));

      await expect(BankAccountService.deleteBankAccount('invalid')).rejects.toThrow(
        'Account not found'
      );
    });
  });

  describe('Complete Bank Account Flow', () => {
    it('should complete full bank account setup', async () => {
      // Step 1: Add new account
      const addData: AddBankAccountRequest = {
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'John Doe',
      };

      const mockAddResponse: BankAccount = {
        id: 'acc1',
        ...addData,
        bankName: 'State Bank of India',
        isPrimary: false,
        isVerified: false,
        createdAt: '2023-12-01T10:00:00Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockAddResponse);
      const addResult = await BankAccountService.addBankAccount(addData);
      expect(addResult.isVerified).toBe(false);

      // Step 2: Verify account
      const verifyData: VerifyBankAccountRequest = {
        accountId: 'acc1',
        verificationMethod: 'PENNY_DROP',
      };

      const mockVerifyResponse: BankAccount = {
        ...mockAddResponse,
        isVerified: true,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockVerifyResponse);
      const verifyResult = await BankAccountService.verifyBankAccount(verifyData);
      expect(verifyResult.isVerified).toBe(true);

      // Step 3: Set as primary
      const mockPrimaryResponse: BankAccount = {
        ...mockVerifyResponse,
        isPrimary: true,
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockPrimaryResponse);
      const primaryResult = await BankAccountService.setPrimaryAccount('acc1');
      expect(primaryResult.isPrimary).toBe(true);

      // Step 4: Get all accounts
      const mockAccounts: BankAccount[] = [mockPrimaryResponse];

      (apiService.get as jest.Mock).mockResolvedValue(mockAccounts);
      const accounts = await BankAccountService.getBankAccounts();
      expect(accounts).toHaveLength(1);
      expect(accounts[0].isPrimary).toBe(true);
    });

    it('should handle multiple accounts and switch primary', async () => {
      // Initial state: 2 accounts, acc1 is primary
      const initialAccounts: BankAccount[] = [
        {
          id: 'acc1',
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          accountHolderName: 'John Doe',
          bankName: 'State Bank of India',
          isPrimary: true,
          isVerified: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: 'acc2',
          accountNumber: '0987654321',
          ifscCode: 'HDFC0001234',
          accountHolderName: 'John Doe',
          bankName: 'HDFC Bank',
          isPrimary: false,
          isVerified: true,
          createdAt: '2023-02-01T00:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(initialAccounts);
      const accounts1 = await BankAccountService.getBankAccounts();
      expect(accounts1.find(a => a.isPrimary)?.id).toBe('acc1');

      // Switch primary to acc2
      const mockUpdatedAcc2: BankAccount = {
        ...initialAccounts[1],
        isPrimary: true,
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockUpdatedAcc2);
      const result = await BankAccountService.setPrimaryAccount('acc2');
      expect(result.isPrimary).toBe(true);
      expect(result.id).toBe('acc2');

      // Verify final state
      const finalAccounts: BankAccount[] = [
        { ...initialAccounts[0], isPrimary: false },
        mockUpdatedAcc2,
      ];

      (apiService.get as jest.Mock).mockResolvedValue(finalAccounts);
      const accounts2 = await BankAccountService.getBankAccounts();
      expect(accounts2.find(a => a.isPrimary)?.id).toBe('acc2');
    });

    it('should handle deletion of non-primary account', async () => {
      // Get accounts
      const mockAccounts: BankAccount[] = [
        {
          id: 'acc1',
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          accountHolderName: 'John Doe',
          bankName: 'State Bank of India',
          isPrimary: true,
          isVerified: true,
          createdAt: '2023-01-01T00:00:00Z',
        },
        {
          id: 'acc2',
          accountNumber: '0987654321',
          ifscCode: 'HDFC0001234',
          accountHolderName: 'John Doe',
          bankName: 'HDFC Bank',
          isPrimary: false,
          isVerified: true,
          createdAt: '2023-02-01T00:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAccounts);
      const accounts1 = await BankAccountService.getBankAccounts();
      expect(accounts1).toHaveLength(2);

      // Delete acc2
      (apiService.delete as jest.Mock).mockResolvedValue({
        message: 'Account deleted',
      });
      await BankAccountService.deleteBankAccount('acc2');

      // Verify remaining accounts
      (apiService.get as jest.Mock).mockResolvedValue([mockAccounts[0]]);
      const accounts2 = await BankAccountService.getBankAccounts();
      expect(accounts2).toHaveLength(1);
      expect(accounts2[0].id).toBe('acc1');
    });
  });
});
