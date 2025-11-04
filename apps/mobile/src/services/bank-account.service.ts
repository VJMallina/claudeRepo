import apiService from './api.service';
import {
  BankAccount,
  AddBankAccountRequest,
  VerifyBankAccountRequest,
} from '@/types/api.types';

class BankAccountService {
  /**
   * Get all bank accounts
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    return apiService.get<BankAccount[]>('/bank-accounts');
  }

  /**
   * Get bank account by ID
   */
  async getBankAccountById(accountId: string): Promise<BankAccount> {
    return apiService.get<BankAccount>(`/bank-accounts/${accountId}`);
  }

  /**
   * Add new bank account
   */
  async addBankAccount(data: AddBankAccountRequest): Promise<BankAccount> {
    return apiService.post<BankAccount>('/bank-accounts', data);
  }

  /**
   * Verify bank account
   */
  async verifyBankAccount(data: VerifyBankAccountRequest): Promise<BankAccount> {
    return apiService.post<BankAccount>('/bank-accounts/verify', data);
  }

  /**
   * Set primary bank account
   */
  async setPrimaryAccount(accountId: string): Promise<BankAccount> {
    return apiService.patch<BankAccount>(`/bank-accounts/${accountId}/set-primary`, {});
  }

  /**
   * Delete bank account
   */
  async deleteBankAccount(accountId: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/bank-accounts/${accountId}`);
  }
}

export default new BankAccountService();
