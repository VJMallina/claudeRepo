import { Transaction, TransactionListResponse, TransactionFilters } from '../types/api.types';
import apiService from './api.service';

class TransactionService {
  /**
   * Get paginated transaction history with filters
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    filters?: TransactionFilters
  ): Promise<TransactionListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    if (filters?.type && filters.type !== 'ALL') {
      queryParams.append('type', filters.type);
    }

    if (filters?.status && filters.status !== 'ALL') {
      queryParams.append('status', filters.status);
    }

    if (filters?.startDate) {
      queryParams.append('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      queryParams.append('endDate', filters.endDate);
    }

    if (filters?.search) {
      queryParams.append('search', filters.search);
    }

    return apiService.get<TransactionListResponse>(
      `/transactions?${queryParams.toString()}`
    );
  }

  /**
   * Get transaction details by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    return apiService.get<Transaction>(`/transactions/${transactionId}`);
  }

  /**
   * Download transaction receipt (returns PDF blob URL or base64)
   */
  async downloadReceipt(transactionId: string): Promise<{ url: string; fileName: string }> {
    return apiService.get<{ url: string; fileName: string }>(
      `/transactions/${transactionId}/receipt`
    );
  }

  /**
   * Share transaction receipt via share sheet
   */
  async getReceiptData(transactionId: string): Promise<{ data: string; mimeType: string }> {
    return apiService.get<{ data: string; mimeType: string }>(
      `/transactions/${transactionId}/receipt/data`
    );
  }
}

export default new TransactionService();
