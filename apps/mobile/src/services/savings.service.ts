import apiService from './api.service';
import {
  SavingsWallet,
  SavingsTransaction,
  WithdrawSavingsRequest,
  SavingsAnalytics,
} from '@/types/api.types';

class SavingsService {
  /**
   * Get savings wallet balance
   */
  async getWallet(): Promise<SavingsWallet> {
    return apiService.get<SavingsWallet>('/savings/wallet');
  }

  /**
   * Get savings transactions
   */
  async getTransactions(params?: {
    limit?: number;
    offset?: number;
    type?: 'CREDIT' | 'DEBIT';
  }): Promise<SavingsTransaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    return apiService.get<SavingsTransaction[]>(`/savings/transactions${query ? `?${query}` : ''}`);
  }

  /**
   * Withdraw from savings
   */
  async withdraw(data: WithdrawSavingsRequest): Promise<{
    message: string;
    transactionId: string;
    amount: number;
  }> {
    return apiService.post('/savings/withdraw', data);
  }

  /**
   * Get savings analytics
   */
  async getAnalytics(): Promise<SavingsAnalytics> {
    return apiService.get<SavingsAnalytics>('/analytics/savings');
  }
}

export default new SavingsService();
