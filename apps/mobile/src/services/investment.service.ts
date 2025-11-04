import apiService from './api.service';
import {
  InvestmentFund,
  UserInvestment,
  PurchaseInvestmentRequest,
  RedeemInvestmentRequest,
  InvestmentAnalytics,
} from '@/types/api.types';

class InvestmentService {
  /**
   * Get all available investment funds
   */
  async getFunds(params?: {
    category?: 'EQUITY' | 'DEBT' | 'HYBRID' | 'LIQUID';
    riskLevel?: 'LOW' | 'MODERATE' | 'HIGH';
    search?: string;
  }): Promise<InvestmentFund[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.riskLevel) queryParams.append('riskLevel', params.riskLevel);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiService.get<InvestmentFund[]>(`/investments/funds${query ? `?${query}` : ''}`);
  }

  /**
   * Get fund details by ID
   */
  async getFundById(fundId: string): Promise<InvestmentFund> {
    return apiService.get<InvestmentFund>(`/investments/funds/${fundId}`);
  }

  /**
   * Purchase investment
   */
  async purchaseInvestment(data: PurchaseInvestmentRequest): Promise<UserInvestment> {
    return apiService.post<UserInvestment>('/investments/purchase', data);
  }

  /**
   * Get user's investments (portfolio)
   */
  async getMyInvestments(): Promise<UserInvestment[]> {
    return apiService.get<UserInvestment[]>('/investments/my-investments');
  }

  /**
   * Get investment analytics
   */
  async getAnalytics(): Promise<InvestmentAnalytics> {
    return apiService.get<InvestmentAnalytics>('/analytics/investments');
  }

  /**
   * Redeem investment
   */
  async redeemInvestment(data: RedeemInvestmentRequest): Promise<{
    message: string;
    redemptionAmount: number;
    units: number;
  }> {
    return apiService.post('/investments/redeem', data);
  }

  /**
   * Get investment by ID
   */
  async getInvestmentById(investmentId: string): Promise<UserInvestment> {
    return apiService.get<UserInvestment>(`/investments/${investmentId}`);
  }
}

export default new InvestmentService();
