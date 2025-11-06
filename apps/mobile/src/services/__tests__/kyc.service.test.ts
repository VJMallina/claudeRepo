import KycService from '../kyc.service';
import apiService from '../api.service';
import {
  VerifyPanRequest,
  VerifyAadhaarRequest,
  VerifyLivenessRequest,
  KycDocument,
} from '@/types/api.types';

// Mock dependencies
jest.mock('../api.service');

describe('KycService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyPan', () => {
    it('should verify PAN successfully', async () => {
      const data: VerifyPanRequest = {
        panNumber: 'ABCDE1234F',
        fullName: 'John Doe',
      };

      const mockResponse: KycDocument = {
        id: 'doc1',
        documentType: 'PAN',
        documentNumber: 'ABCDE1234F',
        verificationStatus: 'VERIFIED',
        verifiedAt: '2023-12-01T10:00:00Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await KycService.verifyPan(data);

      expect(result).toEqual(mockResponse);
      expect(result.verificationStatus).toBe('VERIFIED');
      expect(apiService.post).toHaveBeenCalledWith('/kyc/verify-pan', data);
    });

    it('should handle invalid PAN format', async () => {
      const data: VerifyPanRequest = {
        panNumber: 'INVALID',
        fullName: 'John Doe',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid PAN format'));

      await expect(KycService.verifyPan(data)).rejects.toThrow('Invalid PAN format');
    });

    it('should handle name mismatch', async () => {
      const data: VerifyPanRequest = {
        panNumber: 'ABCDE1234F',
        fullName: 'Wrong Name',
      };

      const mockResponse: KycDocument = {
        id: 'doc1',
        documentType: 'PAN',
        documentNumber: 'ABCDE1234F',
        verificationStatus: 'REJECTED',
        rejectionReason: 'Name mismatch',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await KycService.verifyPan(data);

      expect(result.verificationStatus).toBe('REJECTED');
      expect(result.rejectionReason).toContain('mismatch');
    });
  });

  describe('verifyAadhaar', () => {
    it('should verify Aadhaar successfully', async () => {
      const data: VerifyAadhaarRequest = {
        aadhaarNumber: '999999990019',
        otp: '123456',
      };

      const mockResponse: KycDocument = {
        id: 'doc2',
        documentType: 'AADHAAR',
        documentNumber: '9999****0019',
        verificationStatus: 'VERIFIED',
        verifiedAt: '2023-12-01T10:00:00Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await KycService.verifyAadhaar(data);

      expect(result).toEqual(mockResponse);
      expect(result.verificationStatus).toBe('VERIFIED');
      expect(result.documentType).toBe('AADHAAR');
      expect(apiService.post).toHaveBeenCalledWith('/kyc/verify-aadhaar', data);
    });

    it('should handle invalid Aadhaar number', async () => {
      const data: VerifyAadhaarRequest = {
        aadhaarNumber: '123456',
        otp: '123456',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid Aadhaar number'));

      await expect(KycService.verifyAadhaar(data)).rejects.toThrow('Invalid Aadhaar number');
    });

    it('should handle invalid OTP', async () => {
      const data: VerifyAadhaarRequest = {
        aadhaarNumber: '999999990019',
        otp: '000000',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid OTP'));

      await expect(KycService.verifyAadhaar(data)).rejects.toThrow('Invalid OTP');
    });

    it('should handle OTP expiry', async () => {
      const data: VerifyAadhaarRequest = {
        aadhaarNumber: '999999990019',
        otp: '123456',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('OTP expired'));

      await expect(KycService.verifyAadhaar(data)).rejects.toThrow('OTP expired');
    });
  });

  describe('verifyLiveness', () => {
    it('should verify liveness successfully', async () => {
      const data: VerifyLivenessRequest = {
        selfieUrl: 'https://example.com/selfie.jpg',
      };

      const mockResponse = {
        verified: true,
        livenessScore: 95,
        message: 'Liveness check passed',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await KycService.verifyLiveness(data);

      expect(result.verified).toBe(true);
      expect(result.livenessScore).toBe(95);
      expect(apiService.post).toHaveBeenCalledWith('/kyc/verify-liveness', data);
    });

    it('should fail liveness check with low score', async () => {
      const data: VerifyLivenessRequest = {
        selfieUrl: 'https://example.com/selfie.jpg',
      };

      const mockResponse = {
        verified: false,
        livenessScore: 45,
        message: 'Liveness check failed',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await KycService.verifyLiveness(data);

      expect(result.verified).toBe(false);
      expect(result.livenessScore).toBeLessThan(70);
    });

    it('should handle invalid image URL', async () => {
      const data: VerifyLivenessRequest = {
        selfieUrl: 'invalid-url',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid image URL'));

      await expect(KycService.verifyLiveness(data)).rejects.toThrow('Invalid image URL');
    });
  });

  describe('getDocuments', () => {
    it('should fetch all KYC documents', async () => {
      const mockDocuments: KycDocument[] = [
        {
          id: 'doc1',
          documentType: 'PAN',
          documentNumber: 'ABCDE1234F',
          verificationStatus: 'VERIFIED',
          verifiedAt: '2023-12-01T10:00:00Z',
        },
        {
          id: 'doc2',
          documentType: 'AADHAAR',
          documentNumber: '9999****0019',
          verificationStatus: 'VERIFIED',
          verifiedAt: '2023-12-01T11:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockDocuments);

      const result = await KycService.getDocuments();

      expect(result).toHaveLength(2);
      expect(result[0].documentType).toBe('PAN');
      expect(result[1].documentType).toBe('AADHAAR');
      expect(apiService.get).toHaveBeenCalledWith('/kyc/documents');
    });

    it('should return empty array when no documents', async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await KycService.getDocuments();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch documents'));

      await expect(KycService.getDocuments()).rejects.toThrow('Failed to fetch documents');
    });
  });

  describe('getStatus', () => {
    it('should get KYC status for unverified user', async () => {
      const mockStatus = {
        kycLevel: 0 as const,
        kycStatus: 'PENDING' as const,
        documents: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await KycService.getStatus();

      expect(result.kycLevel).toBe(0);
      expect(result.kycStatus).toBe('PENDING');
      expect(result.documents).toHaveLength(0);
      expect(apiService.get).toHaveBeenCalledWith('/kyc/status');
    });

    it('should get KYC status for Level 1 verified user', async () => {
      const mockStatus = {
        kycLevel: 1 as const,
        kycStatus: 'VERIFIED' as const,
        documents: [
          {
            id: 'doc1',
            documentType: 'PAN',
            documentNumber: 'ABCDE1234F',
            verificationStatus: 'VERIFIED',
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await KycService.getStatus();

      expect(result.kycLevel).toBe(1);
      expect(result.kycStatus).toBe('VERIFIED');
      expect(result.documents).toHaveLength(1);
    });

    it('should get KYC status for Level 2 verified user', async () => {
      const mockStatus = {
        kycLevel: 2 as const,
        kycStatus: 'VERIFIED' as const,
        documents: [
          {
            id: 'doc1',
            documentType: 'PAN',
            documentNumber: 'ABCDE1234F',
            verificationStatus: 'VERIFIED',
          },
          {
            id: 'doc2',
            documentType: 'AADHAAR',
            documentNumber: '9999****0019',
            verificationStatus: 'VERIFIED',
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await KycService.getStatus();

      expect(result.kycLevel).toBe(2);
      expect(result.kycStatus).toBe('VERIFIED');
      expect(result.documents).toHaveLength(2);
    });

    it('should get KYC status when under review', async () => {
      const mockStatus = {
        kycLevel: 0 as const,
        kycStatus: 'UNDER_REVIEW' as const,
        documents: [
          {
            id: 'doc1',
            documentType: 'PAN',
            documentNumber: 'ABCDE1234F',
            verificationStatus: 'PENDING',
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await KycService.getStatus();

      expect(result.kycStatus).toBe('UNDER_REVIEW');
    });

    it('should get KYC status when rejected', async () => {
      const mockStatus = {
        kycLevel: 0 as const,
        kycStatus: 'REJECTED' as const,
        documents: [
          {
            id: 'doc1',
            documentType: 'PAN',
            documentNumber: 'ABCDE1234F',
            verificationStatus: 'REJECTED',
            rejectionReason: 'Name mismatch',
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await KycService.getStatus();

      expect(result.kycStatus).toBe('REJECTED');
      expect(result.documents[0].rejectionReason).toBeDefined();
    });
  });

  describe('Complete KYC Flow', () => {
    it('should complete Level 1 KYC verification', async () => {
      // Step 1: Verify PAN
      const panData: VerifyPanRequest = {
        panNumber: 'ABCDE1234F',
        fullName: 'John Doe',
      };

      const mockPanResponse: KycDocument = {
        id: 'doc1',
        documentType: 'PAN',
        documentNumber: 'ABCDE1234F',
        verificationStatus: 'VERIFIED',
        verifiedAt: '2023-12-01T10:00:00Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockPanResponse);
      const panResult = await KycService.verifyPan(panData);
      expect(panResult.verificationStatus).toBe('VERIFIED');

      // Step 2: Check status
      const mockStatus = {
        kycLevel: 1 as const,
        kycStatus: 'VERIFIED' as const,
        documents: [mockPanResponse],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);
      const status = await KycService.getStatus();
      expect(status.kycLevel).toBe(1);
    });

    it('should complete Level 2 KYC verification', async () => {
      // Step 1: Verify PAN (already done in previous flow)

      // Step 2: Verify Aadhaar
      const aadhaarData: VerifyAadhaarRequest = {
        aadhaarNumber: '999999990019',
        otp: '123456',
      };

      const mockAadhaarResponse: KycDocument = {
        id: 'doc2',
        documentType: 'AADHAAR',
        documentNumber: '9999****0019',
        verificationStatus: 'VERIFIED',
        verifiedAt: '2023-12-01T11:00:00Z',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockAadhaarResponse);
      const aadhaarResult = await KycService.verifyAadhaar(aadhaarData);
      expect(aadhaarResult.verificationStatus).toBe('VERIFIED');

      // Step 3: Verify Liveness
      const livenessData: VerifyLivenessRequest = {
        selfieUrl: 'https://example.com/selfie.jpg',
      };

      const mockLivenessResponse = {
        verified: true,
        livenessScore: 95,
        message: 'Liveness verified',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockLivenessResponse);
      const livenessResult = await KycService.verifyLiveness(livenessData);
      expect(livenessResult.verified).toBe(true);

      // Step 4: Check final status
      const mockFinalStatus = {
        kycLevel: 2 as const,
        kycStatus: 'VERIFIED' as const,
        documents: [
          {
            id: 'doc1',
            documentType: 'PAN',
            documentNumber: 'ABCDE1234F',
            verificationStatus: 'VERIFIED',
          },
          mockAadhaarResponse,
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockFinalStatus);
      const finalStatus = await KycService.getStatus();
      expect(finalStatus.kycLevel).toBe(2);
      expect(finalStatus.kycStatus).toBe('VERIFIED');
    });
  });
});
