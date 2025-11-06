import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PanVerificationService } from './integrations/pan-verification.service';
import { AadhaarVerificationService } from './integrations/aadhaar-verification.service';
import { FaceDetectionService } from './integrations/face-detection.service';
import { BankVerificationService } from './integrations/bank-verification.service';

/**
 * Integration Tests for Complete KYC Flow
 *
 * Tests the entire KYC verification process from start to finish:
 * 1. PAN Verification
 * 2. Aadhaar Verification (with OTP)
 * 3. Bank Account Verification
 * 4. Face Detection & Liveness
 * 5. Face Matching
 */
describe('KYC Integration Tests', () => {
  let panService: PanVerificationService;
  let aadhaarService: AadhaarVerificationService;
  let faceService: FaceDetectionService;
  let bankService: BankVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        PanVerificationService,
        AadhaarVerificationService,
        FaceDetectionService,
        BankVerificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'development',
                // All API keys null for test mode
                PAN_VERIFICATION_API_KEY: null,
                AADHAAR_API_KEY: null,
                AZURE_FACE_API_KEY: null,
                RAZORPAY_KEY_ID: null,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    panService = module.get<PanVerificationService>(PanVerificationService);
    aadhaarService = module.get<AadhaarVerificationService>(AadhaarVerificationService);
    faceService = module.get<FaceDetectionService>(FaceDetectionService);
    bankService = module.get<BankVerificationService>(BankVerificationService);
  });

  describe('Complete KYC Flow - Success Path', () => {
    it('should complete full KYC verification for a user', async () => {
      const userData = {
        name: 'Rahul Kumar',
        pan: 'AAAAA0000A',
        aadhaar: '999999990019',
        accountNumber: '1234567890',
        ifsc: 'SBIN0001234',
        selfieUrl: 'https://example.com/selfie.jpg',
      };

      // Step 1: Verify PAN
      console.log('Step 1: Verifying PAN...');
      const panResult = await panService.verifyPan(userData.pan, userData.name);

      expect(panResult.verified).toBe(true);
      expect(panResult.panNumber).toBe(userData.pan);
      expect(panResult.status).toBe('VALID');
      console.log('✅ PAN verified successfully');

      // Step 2: Initiate Aadhaar Verification
      console.log('\nStep 2: Initiating Aadhaar verification...');
      const aadhaarInit = await aadhaarService.initiateVerification(userData.aadhaar);

      expect(aadhaarInit.success).toBe(true);
      expect(aadhaarInit.referenceId).toBeDefined();
      expect(aadhaarInit.otp).toBeDefined();
      console.log(`✅ OTP sent: ${aadhaarInit.otp}`);

      // Step 3: Verify Aadhaar OTP
      console.log('\nStep 3: Verifying Aadhaar OTP...');
      const aadhaarResult = await aadhaarService.verifyOtp(
        aadhaarInit.referenceId,
        aadhaarInit.otp
      );

      expect(aadhaarResult.verified).toBe(true);
      expect(aadhaarResult.aadhaarNumber).toBe(userData.aadhaar);
      expect(aadhaarResult.fullName).toBe('Rahul Kumar');
      console.log('✅ Aadhaar verified successfully');

      // Step 4: Verify Bank Account
      console.log('\nStep 4: Verifying bank account...');
      const bankResult = await bankService.verifyBankAccount(
        userData.accountNumber,
        userData.ifsc,
        userData.name
      );

      expect(bankResult.verified).toBe(true);
      expect(bankResult.accountNumber).toBe(userData.accountNumber);
      expect(bankResult.bankDetails).toBeDefined();
      console.log(`✅ Bank account verified: ${bankResult.bankDetails.bankName}`);

      // Step 5: Face Detection & Liveness
      console.log('\nStep 5: Detecting face and liveness...');
      const faceResult = await faceService.detectFaceAndLiveness(userData.selfieUrl);

      expect(faceResult.faceDetected).toBe(true);
      expect(faceResult.livenessScore).toBeGreaterThanOrEqual(70);
      expect(faceResult.qualityScore).toBeGreaterThanOrEqual(70);
      console.log(`✅ Face detected - Liveness: ${faceResult.livenessScore}, Quality: ${faceResult.qualityScore}`);

      // Step 6: Face Matching with Aadhaar
      console.log('\nStep 6: Matching face with Aadhaar photo...');
      const aadhaarPhotoUrl = 'https://example.com/aadhaar-photo.jpg';
      const matchResult = await faceService.compareFaces(
        userData.selfieUrl,
        aadhaarPhotoUrl
      );

      expect(matchResult.success).toBe(true);
      console.log(`✅ Face match result: ${matchResult.matched ? 'MATCHED' : 'NOT MATCHED'} (${matchResult.similarity}%)`);

      // Summary
      console.log('\n========================================');
      console.log('KYC VERIFICATION COMPLETED SUCCESSFULLY');
      console.log('========================================');
      console.log(`User: ${userData.name}`);
      console.log(`PAN: ${userData.pan} ✅`);
      console.log(`Aadhaar: XXXX-XXXX-${userData.aadhaar.slice(-4)} ✅`);
      console.log(`Bank: ${userData.ifsc} ✅`);
      console.log(`Face: ${faceResult.livenessScore}% liveness ✅`);
      console.log('========================================\n');
    });

    it('should handle Level 1 KYC (PAN only)', async () => {
      const userData = {
        name: 'Test User',
        pan: 'AAAAA0000A',
      };

      // Level 1: Only PAN verification needed
      const panResult = await panService.verifyPan(userData.pan, userData.name);

      expect(panResult.verified).toBe(true);
      console.log('✅ Level 1 KYC completed (PAN verified)');
    });

    it('should handle Level 2 KYC (PAN + Aadhaar + Face)', async () => {
      const userData = {
        name: 'Priya Sharma',
        pan: 'AAAAA0000A',
        aadhaar: '999999990028',
        selfieUrl: 'https://example.com/priya-selfie.jpg',
      };

      // Step 1: PAN
      const panResult = await panService.verifyPan(userData.pan, userData.name);
      expect(panResult.verified).toBe(true);

      // Step 2: Aadhaar
      const aadhaarInit = await aadhaarService.initiateVerification(userData.aadhaar);
      const aadhaarResult = await aadhaarService.verifyOtp(
        aadhaarInit.referenceId,
        aadhaarInit.otp
      );
      expect(aadhaarResult.verified).toBe(true);
      expect(aadhaarResult.fullName).toBe('Priya Sharma');

      // Step 3: Face
      const faceResult = await faceService.detectFaceAndLiveness(userData.selfieUrl);
      expect(faceResult.faceDetected).toBe(true);

      console.log('✅ Level 2 KYC completed (PAN + Aadhaar + Face)');
    });
  });

  describe('Complete KYC Flow - Failure Paths', () => {
    it('should fail on invalid PAN', async () => {
      const panResult = await panService.verifyPan('BBBBB1111B', 'Test User');

      expect(panResult.verified).toBe(false);
      expect(panResult.status).toBe('INVALID');
      console.log('✅ Correctly rejected invalid PAN');
    });

    it('should fail on invalid Aadhaar', async () => {
      const aadhaarInit = await aadhaarService.initiateVerification('111111110000');

      expect(aadhaarInit.success).toBe(false);
      console.log('✅ Correctly rejected invalid Aadhaar');
    });

    it('should fail on wrong Aadhaar OTP', async () => {
      const aadhaarInit = await aadhaarService.initiateVerification('999999990019');
      const wrongOtp = '000000'; // Wrong OTP

      const aadhaarResult = await aadhaarService.verifyOtp(
        aadhaarInit.referenceId,
        wrongOtp
      );

      expect(aadhaarResult.verified).toBe(false);
      expect(aadhaarResult.message).toContain('Invalid OTP');
      console.log('✅ Correctly rejected wrong OTP');
    });

    it('should fail on blacklisted bank account', async () => {
      const bankResult = await bankService.verifyBankAccount(
        '0000000000', // Blacklisted
        'SBIN0001234',
        'Test User'
      );

      expect(bankResult.verified).toBe(false);
      console.log('✅ Correctly rejected blacklisted account');
    });

    it('should fail on invalid IFSC code', async () => {
      const bankResult = await bankService.verifyBankAccount(
        '1234567890',
        'INVALID123', // Invalid IFSC
        'Test User'
      );

      expect(bankResult.verified).toBe(false);
      expect(bankResult.message).toContain('Invalid IFSC');
      console.log('✅ Correctly rejected invalid IFSC');
    });
  });

  describe('Multiple Users KYC Flow', () => {
    it('should handle KYC for multiple users concurrently', async () => {
      const users = [
        { name: 'Rahul Kumar', pan: 'AAAAA0000A', aadhaar: '999999990019' },
        { name: 'Priya Sharma', pan: 'CCCCC2222C', aadhaar: '999999990028' },
        { name: 'Amit Patel', pan: 'AAAAA0000A', aadhaar: '999999990037' },
      ];

      const results = await Promise.all(
        users.map(async (user) => {
          // Verify PAN
          const panResult = await panService.verifyPan(user.pan, user.name);

          // Verify Aadhaar
          const aadhaarInit = await aadhaarService.initiateVerification(user.aadhaar);
          const aadhaarResult = await aadhaarService.verifyOtp(
            aadhaarInit.referenceId,
            aadhaarInit.otp
          );

          return {
            name: user.name,
            panVerified: panResult.verified,
            aadhaarVerified: aadhaarResult.verified,
          };
        })
      );

      // All users should be verified
      results.forEach((result) => {
        expect(result.panVerified).toBe(true);
        expect(result.aadhaarVerified).toBe(true);
        console.log(`✅ ${result.name} - KYC completed`);
      });

      expect(results).toHaveLength(3);
    });
  });

  describe('KYC Performance Tests', () => {
    it('should complete KYC within acceptable time limits', async () => {
      const startTime = Date.now();

      // Complete KYC flow
      const panResult = await panService.verifyPan('AAAAA0000A', 'Test User');
      const aadhaarInit = await aadhaarService.initiateVerification('999999990019');
      const aadhaarResult = await aadhaarService.verifyOtp(
        aadhaarInit.referenceId,
        aadhaarInit.otp
      );
      const bankResult = await bankService.verifyBankAccount(
        '1234567890',
        'SBIN0001234',
        'Test User'
      );
      const faceResult = await faceService.detectFaceAndLiveness(
        'https://example.com/selfie.jpg'
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(panResult.verified).toBe(true);
      expect(aadhaarResult.verified).toBe(true);
      expect(bankResult.verified).toBe(true);
      expect(faceResult.faceDetected).toBe(true);

      // Should complete within 5 seconds in test mode
      expect(duration).toBeLessThan(5000);

      console.log(`✅ KYC completed in ${duration}ms`);
    });

    it('should handle 10 concurrent KYC verifications', async () => {
      const startTime = Date.now();

      const verifications = Array.from({ length: 10 }, (_, i) => ({
        name: `User ${i + 1}`,
        pan: 'AAAAA0000A',
        aadhaar: '999999990019',
      }));

      const results = await Promise.all(
        verifications.map(async (user) => {
          const panResult = await panService.verifyPan(user.pan, user.name);
          const aadhaarInit = await aadhaarService.initiateVerification(user.aadhaar);
          const aadhaarResult = await aadhaarService.verifyOtp(
            aadhaarInit.referenceId,
            aadhaarInit.otp
          );

          return panResult.verified && aadhaarResult.verified;
        })
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // All should succeed
      expect(results.every(r => r === true)).toBe(true);

      // Should complete within 10 seconds
      expect(duration).toBeLessThan(10000);

      console.log(`✅ 10 concurrent KYC verifications completed in ${duration}ms`);
    });
  });

  describe('Edge Cases', () => {
    it('should handle expired Aadhaar OTP', async () => {
      jest.useFakeTimers();

      const aadhaarInit = await aadhaarService.initiateVerification('999999990019');

      // Fast forward time by 3 minutes (OTP expires in 2 minutes)
      jest.advanceTimersByTime(180000);

      const aadhaarResult = await aadhaarService.verifyOtp(
        aadhaarInit.referenceId,
        aadhaarInit.otp
      );

      expect(aadhaarResult.verified).toBe(false);
      expect(aadhaarResult.message).toContain('expired');

      jest.useRealTimers();
      console.log('✅ Correctly handled expired OTP');
    });

    it('should handle invalid PAN format', async () => {
      const invalidPans = [
        'ABCD1234', // Too short
        'ABCDE1234567', // Too long
        'abcde1234f', // Lowercase
        '12345ABCDE', // Numbers first
        'ABCD@1234F', // Special char
      ];

      for (const pan of invalidPans) {
        const result = await panService.verifyPan(pan, 'Test User');
        expect(result.verified).toBe(false);
      }

      console.log('✅ Correctly handled invalid PAN formats');
    });

    it('should handle different Aadhaar test numbers', async () => {
      const testNumbers = [
        { number: '999999990019', name: 'Rahul Kumar' },
        { number: '999999990028', name: 'Priya Sharma' },
        { number: '999999990037', name: 'Amit Patel' },
        { number: '999999990046', name: 'Neha Singh' },
      ];

      for (const test of testNumbers) {
        const init = await aadhaarService.initiateVerification(test.number);
        const result = await aadhaarService.verifyOtp(init.referenceId, init.otp);

        expect(result.verified).toBe(true);
        expect(result.fullName).toBe(test.name);
      }

      console.log('✅ All UIDAI test numbers verified correctly');
    });
  });
});
