import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AadhaarVerificationService } from './aadhaar-verification.service';

describe('AadhaarVerificationService', () => {
  let service: AadhaarVerificationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AadhaarVerificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'development',
                AADHAAR_API_KEY: null,
                AADHAAR_API_URL: null,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AadhaarVerificationService>(AadhaarVerificationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateVerification - Test Mode', () => {
    it('should initiate verification for valid test Aadhaar 999999990019', async () => {
      const result = await service.initiateVerification('999999990019');

      expect(result.success).toBe(true);
      expect(result.referenceId).toBeDefined();
      expect(result.referenceId).toHaveLength(32); // Hex string
      expect(result.otp).toBeDefined(); // OTP provided in test mode
      expect(result.otp).toHaveLength(6);
      expect(result.message).toContain('TEST MODE');
    });

    it('should initiate for all UIDAI test numbers', async () => {
      const testNumbers = ['999999990019', '999999990028', '999999990037', '999999990046'];

      for (const aadhaarNumber of testNumbers) {
        const result = await service.initiateVerification(aadhaarNumber);
        expect(result.success).toBe(true);
        expect(result.referenceId).toBeDefined();
      }
    });

    it('should reject invalid test Aadhaar 111111110000', async () => {
      const result = await service.initiateVerification('111111110000');

      expect(result.success).toBe(false);
      expect(result.referenceId).toBe('');
      expect(result.message).toContain('Invalid');
    });

    it('should reject invalid Aadhaar format', async () => {
      const result = await service.initiateVerification('12345');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid Aadhaar format');
    });

    it('should reject Aadhaar with letters', async () => {
      const result = await service.initiateVerification('ABCD12345678');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid Aadhaar format');
    });

    it('should accept any 12-digit number in test mode', async () => {
      const result = await service.initiateVerification('123456789012');

      expect(result.success).toBe(true);
      expect(result.referenceId).toBeDefined();
    });
  });

  describe('verifyOtp - Test Mode', () => {
    let referenceId: string;
    let otp: string;

    beforeEach(async () => {
      const initResult = await service.initiateVerification('999999990019');
      referenceId = initResult.referenceId;
      otp = initResult.otp;
    });

    it('should verify correct OTP and return Aadhaar data', async () => {
      const result = await service.verifyOtp(referenceId, otp);

      expect(result.verified).toBe(true);
      expect(result.aadhaarNumber).toBe('999999990019');
      expect(result.fullName).toBe('Rahul Kumar');
      expect(result.dob).toBe('15/08/1990');
      expect(result.gender).toBe('M');
      expect(result.address).toContain('Mumbai');
      expect(result.message).toContain('TEST MODE');
    });

    it('should return correct data for different test Aadhaar numbers', async () => {
      // Test for Priya Sharma
      const initResult2 = await service.initiateVerification('999999990028');
      const result2 = await service.verifyOtp(initResult2.referenceId, initResult2.otp);

      expect(result2.verified).toBe(true);
      expect(result2.fullName).toBe('Priya Sharma');
      expect(result2.dob).toBe('22/03/1995');
      expect(result2.gender).toBe('F');
      expect(result2.address).toContain('Bangalore');
    });

    it('should reject invalid OTP', async () => {
      const result = await service.verifyOtp(referenceId, '000000');

      expect(result.verified).toBe(false);
      expect(result.message).toContain('Invalid OTP');
    });

    it('should reject invalid reference ID', async () => {
      const result = await service.verifyOtp('invalid-reference-id', otp);

      expect(result.verified).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });

    it('should reject expired OTP', async () => {
      // Wait for OTP to expire (mocked by manipulating time)
      jest.useFakeTimers();
      jest.advanceTimersByTime(121000); // 121 seconds (> 2 minutes)

      const result = await service.verifyOtp(referenceId, otp);

      expect(result.verified).toBe(false);
      expect(result.message).toContain('expired');

      jest.useRealTimers();
    });
  });

  describe('isValidAadhaarFormat', () => {
    it('should validate correct Aadhaar format', () => {
      expect(service.isValidAadhaarFormat('999999990019')).toBe(true);
      expect(service.isValidAadhaarFormat('123456789012')).toBe(true);
      expect(service.isValidAadhaarFormat('000000000000')).toBe(true);
    });

    it('should reject incorrect Aadhaar formats', () => {
      expect(service.isValidAadhaarFormat('12345')).toBe(false); // Too short
      expect(service.isValidAadhaarFormat('1234567890123')).toBe(false); // Too long
      expect(service.isValidAadhaarFormat('ABCD12345678')).toBe(false); // Letters
      expect(service.isValidAadhaarFormat('1234-5678-9012')).toBe(false); // Hyphens
      expect(service.isValidAadhaarFormat('')).toBe(false); // Empty
    });
  });

  describe('Complete Aadhaar Verification Flow', () => {
    it('should complete full verification flow successfully', async () => {
      // Step 1: Initiate verification
      const initResult = await service.initiateVerification('999999990019');
      expect(initResult.success).toBe(true);

      // Step 2: Verify OTP
      const verifyResult = await service.verifyOtp(initResult.referenceId, initResult.otp);
      expect(verifyResult.verified).toBe(true);
      expect(verifyResult.fullName).toBe('Rahul Kumar');
    });

    it('should handle multiple concurrent verifications', async () => {
      // Initiate multiple verifications
      const init1 = await service.initiateVerification('999999990019');
      const init2 = await service.initiateVerification('999999990028');
      const init3 = await service.initiateVerification('999999990037');

      // Verify all
      const verify1 = await service.verifyOtp(init1.referenceId, init1.otp);
      const verify2 = await service.verifyOtp(init2.referenceId, init2.otp);
      const verify3 = await service.verifyOtp(init3.referenceId, init3.otp);

      expect(verify1.verified).toBe(true);
      expect(verify1.fullName).toBe('Rahul Kumar');

      expect(verify2.verified).toBe(true);
      expect(verify2.fullName).toBe('Priya Sharma');

      expect(verify3.verified).toBe(true);
      expect(verify3.fullName).toBe('Amit Patel');
    });
  });
});
