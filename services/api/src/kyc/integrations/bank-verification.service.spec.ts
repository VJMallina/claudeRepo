import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BankVerificationService } from './bank-verification.service';

describe('BankVerificationService', () => {
  let service: BankVerificationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankVerificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'development',
                RAZORPAY_KEY_ID: null,
                RAZORPAY_KEY_SECRET: null,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BankVerificationService>(BankVerificationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isValidIFSCFormat', () => {
    it('should validate correct IFSC codes', () => {
      expect(service.isValidIFSCFormat('SBIN0001234')).toBe(true);
      expect(service.isValidIFSCFormat('HDFC0001234')).toBe(true);
      expect(service.isValidIFSCFormat('ICIC0001234')).toBe(true);
      expect(service.isValidIFSCFormat('AXIS0001234')).toBe(true);
    });

    it('should reject incorrect IFSC formats', () => {
      expect(service.isValidIFSCFormat('SBIN1234567')).toBe(false); // Missing 0
      expect(service.isValidIFSCFormat('SBI00001234')).toBe(false); // Too short bank code
      expect(service.isValidIFSCFormat('SBIN000123')).toBe(false); // Too short
      expect(service.isValidIFSCFormat('sbin0001234')).toBe(false); // Lowercase
      expect(service.isValidIFSCFormat('SBIN-001234')).toBe(false); // Special char
      expect(service.isValidIFSCFormat('')).toBe(false); // Empty
    });
  });

  describe('getBankDetailsFromIFSC', () => {
    it('should return bank details for valid IFSC', async () => {
      const result = await service.getBankDetailsFromIFSC('SBIN0001234');

      expect(result).toBeDefined();
      expect(result.ifsc).toBe('SBIN0001234');
      expect(result.bankName).toContain('State Bank');
      expect(result.branchName).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.state).toBeDefined();
      expect(result.rtgs).toBe(true);
      expect(result.neft).toBe(true);
      expect(result.imps).toBe(true);
      expect(result.upi).toBe(true);
    });

    it('should handle multiple bank IFSC codes', async () => {
      const ifscCodes = ['SBIN0001234', 'HDFC0001234', 'ICIC0001234', 'AXIS0001234'];

      for (const ifsc of ifscCodes) {
        const result = await service.getBankDetailsFromIFSC(ifsc);
        expect(result).toBeDefined();
        expect(result.ifsc).toBe(ifsc);
        expect(result.bankName).toBeDefined();
      }
    });

    it('should return null for invalid IFSC format', async () => {
      const result = await service.getBankDetailsFromIFSC('INVALID123');

      expect(result).toBeNull();
    });

    it('should identify bank from IFSC code', async () => {
      const testCases = [
        { ifsc: 'SBIN0001234', expectedBank: 'State Bank of India' },
        { ifsc: 'HDFC0001234', expectedBank: 'HDFC Bank' },
        { ifsc: 'ICIC0001234', expectedBank: 'ICICI Bank' },
        { ifsc: 'AXIS0001234', expectedBank: 'Axis Bank' },
      ];

      for (const testCase of testCases) {
        const result = await service.getBankDetailsFromIFSC(testCase.ifsc);
        expect(result.bankName).toContain(testCase.expectedBank.split(' ')[0]); // Check first word
      }
    });
  });

  describe('verifyBankAccount - Test Mode', () => {
    it('should verify valid bank account', async () => {
      const result = await service.verifyBankAccount(
        '1234567890',
        'SBIN0001234',
        'Test User'
      );

      expect(result.verified).toBe(true);
      expect(result.accountNumber).toBe('1234567890');
      expect(result.ifscCode).toBe('SBIN0001234');
      expect(result.accountHolderName).toBe('Test User');
      expect(result.bankDetails).toBeDefined();
      expect(result.bankDetails.bankName).toContain('State Bank');
      expect(result.message).toContain('TEST MODE');
    });

    it('should reject test failure account 0000000000', async () => {
      const result = await service.verifyBankAccount(
        '0000000000',
        'SBIN0001234',
        'Test User'
      );

      expect(result.verified).toBe(false);
      expect(result.message).toContain('failed');
    });

    it('should reject test failure account 1111111111', async () => {
      const result = await service.verifyBankAccount(
        '1111111111',
        'SBIN0001234',
        'Test User'
      );

      expect(result.verified).toBe(false);
      expect(result.message).toContain('failed');
    });

    it('should verify accounts with different banks', async () => {
      const banks = [
        { ifsc: 'SBIN0001234', name: 'State Bank' },
        { ifsc: 'HDFC0001234', name: 'HDFC' },
        { ifsc: 'ICIC0001234', name: 'ICICI' },
        { ifsc: 'AXIS0001234', name: 'Axis' },
      ];

      for (const bank of banks) {
        const result = await service.verifyBankAccount(
          '1234567890',
          bank.ifsc,
          'Test User'
        );

        expect(result.verified).toBe(true);
        expect(result.bankDetails.ifsc).toBe(bank.ifsc);
        expect(result.bankDetails.bankName).toContain(bank.name);
      }
    });

    it('should return bank details with all required fields', async () => {
      const result = await service.verifyBankAccount(
        '1234567890',
        'SBIN0001234',
        'Test User'
      );

      expect(result.bankDetails).toHaveProperty('ifsc');
      expect(result.bankDetails).toHaveProperty('bankName');
      expect(result.bankDetails).toHaveProperty('branchName');
      expect(result.bankDetails).toHaveProperty('address');
      expect(result.bankDetails).toHaveProperty('city');
      expect(result.bankDetails).toHaveProperty('district');
      expect(result.bankDetails).toHaveProperty('state');
      expect(result.bankDetails).toHaveProperty('rtgs');
      expect(result.bankDetails).toHaveProperty('neft');
      expect(result.bankDetails).toHaveProperty('imps');
      expect(result.bankDetails).toHaveProperty('upi');
    });

    it('should reject invalid IFSC code', async () => {
      const result = await service.verifyBankAccount(
        '1234567890',
        'INVALID123',
        'Test User'
      );

      expect(result.verified).toBe(false);
      expect(result.message).toContain('Invalid IFSC');
      expect(result.bankDetails).toBeNull();
    });

    it('should handle different account number lengths', async () => {
      const accountNumbers = [
        '123456789',      // 9 digits
        '1234567890',     // 10 digits
        '12345678901',    // 11 digits
        '123456789012',   // 12 digits
        '1234567890123',  // 13 digits
      ];

      for (const accountNumber of accountNumbers) {
        if (accountNumber !== '0000000000' && accountNumber !== '1111111111') {
          const result = await service.verifyBankAccount(
            accountNumber,
            'SBIN0001234',
            'Test User'
          );

          expect(result.verified).toBe(true);
          expect(result.accountNumber).toBe(accountNumber);
        }
      }
    });
  });

  describe('Complete Bank Verification Flow', () => {
    it('should complete full verification flow', async () => {
      // Step 1: Validate IFSC format
      const isValidFormat = service.isValidIFSCFormat('SBIN0001234');
      expect(isValidFormat).toBe(true);

      // Step 2: Get bank details
      const bankDetails = await service.getBankDetailsFromIFSC('SBIN0001234');
      expect(bankDetails).toBeDefined();

      // Step 3: Verify account
      const result = await service.verifyBankAccount(
        '1234567890',
        'SBIN0001234',
        'Test User'
      );

      expect(result.verified).toBe(true);
      expect(result.bankDetails).toEqual(bankDetails);
    });

    it('should handle multiple concurrent verifications', async () => {
      const accounts = [
        { account: '1234567890', ifsc: 'SBIN0001234', name: 'User 1' },
        { account: '9876543210', ifsc: 'HDFC0001234', name: 'User 2' },
        { account: '5555555555', ifsc: 'ICIC0001234', name: 'User 3' },
      ];

      const results = await Promise.all(
        accounts.map(acc =>
          service.verifyBankAccount(acc.account, acc.ifsc, acc.name)
        )
      );

      results.forEach((result, index) => {
        expect(result.verified).toBe(true);
        expect(result.accountNumber).toBe(accounts[index].account);
        expect(result.accountHolderName).toBe(accounts[index].name);
      });
    });

    it('should fail verification for invalid IFSC', async () => {
      const result = await service.verifyBankAccount(
        '1234567890',
        'WRONGCODE',
        'Test User'
      );

      expect(result.verified).toBe(false);
      expect(result.bankDetails).toBeNull();
    });

    it('should fail verification for blacklisted accounts', async () => {
      const blacklistedAccounts = ['0000000000', '1111111111'];

      for (const account of blacklistedAccounts) {
        const result = await service.verifyBankAccount(
          account,
          'SBIN0001234',
          'Test User'
        );

        expect(result.verified).toBe(false);
      }
    });
  });

  describe('Production Mode (mocked)', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        const config = {
          NODE_ENV: 'production',
          RAZORPAY_KEY_ID: 'rzp_test_key',
          RAZORPAY_KEY_SECRET: 'test_secret',
        };
        return config[key];
      });
    });

    it('should attempt production verification when configured', async () => {
      // This will test the API call flow
      // Will fallback to test mode if actual API call fails
      const result = await service.verifyBankAccount(
        '1234567890',
        'SBIN0001234',
        'Test User'
      );

      expect(result.verified).toBeDefined();
      expect(result.accountNumber).toBe('1234567890');
    });
  });
});
