import apiService from './api.service';
import { Payment, CreatePaymentRequest } from '@/types/api.types';

class PaymentService {
  /**
   * Get payment history
   */
  async getPayments(params?: {
    limit?: number;
    offset?: number;
    status?: 'SUCCESS' | 'FAILED' | 'PENDING';
  }): Promise<Payment[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiService.get<Payment[]>(`/payments${query ? `?${query}` : ''}`);
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    return apiService.get<Payment>(`/payments/${paymentId}`);
  }

  /**
   * Create payment
   */
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return apiService.post<Payment>('/payments', data);
  }
}

export default new PaymentService();
