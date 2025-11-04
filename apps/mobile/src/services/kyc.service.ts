import apiService from './api.service';
import {
  VerifyPanRequest,
  VerifyAadhaarRequest,
  VerifyLivenessRequest,
  KycDocument,
} from '@/types/api.types';

class KycService {
  /**
   * Verify PAN card (Level 1 KYC)
   */
  async verifyPan(data: VerifyPanRequest): Promise<KycDocument> {
    return apiService.post<KycDocument>('/kyc/verify-pan', data);
  }

  /**
   * Verify Aadhaar (Level 2 KYC - Part 1)
   */
  async verifyAadhaar(data: VerifyAadhaarRequest): Promise<KycDocument> {
    return apiService.post<KycDocument>('/kyc/verify-aadhaar', data);
  }

  /**
   * Verify liveness (Level 2 KYC - Part 2)
   */
  async verifyLiveness(data: VerifyLivenessRequest): Promise<{
    verified: boolean;
    livenessScore: number;
    message: string;
  }> {
    return apiService.post('/kyc/verify-liveness', data);
  }

  /**
   * Get all KYC documents for user
   */
  async getDocuments(): Promise<KycDocument[]> {
    return apiService.get<KycDocument[]>('/kyc/documents');
  }

  /**
   * Get KYC status
   */
  async getStatus(): Promise<{
    kycLevel: 0 | 1 | 2;
    kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
    documents: KycDocument[];
  }> {
    return apiService.get('/kyc/status');
  }
}

export default new KycService();
