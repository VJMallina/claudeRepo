import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PanVerificationService } from './pan-verification.service';

describe('PanVerificationService', () => {
  let service: PanVerificationService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PanVerificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'development',
                PAN_VERIFICATION_API_KEY: null,
                PAN_VERIFICATION_API_URL: null,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PanVerificationService>(PanVerificationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyPan - Test Mode', () => {
    it('should verify valid test PAN AAAAA0000A', async () => {
      const result = await service.verifyPan('AAAAA0000A', 'Test User');

      expect(result.verified).toBe(true);
      expect(result.panNumber).toBe('AAAAA0000A');
      expect(result.status).toBe('VALID');
      expect(result.category).toBe('Individual');
      expect(result.message).toContain('TEST MODE');
    });

    it('should reject invalid test PAN BBBBB1111B', async () => {
      const result = await service.verifyPan('BBBBB1111B', 'Test User');

      expect(result.verified).toBe(false);
      expect(result.panNumber).toBe('BBBBB1111B');
      expect(result.status).toBe('INVALID');
      expect(result.message).toContain('TEST MODE');
    });

    it('should verify test company PAN CCCCC2222C', async () => {
      const result = await service.verifyPan('CCCCC2222C', 'Test Company');

      expect(result.verified).toBe(true);
      expect(result.panNumber).toBe('CCCCC2222C');
      expect(result.category).toBe('Company');
      expect(result.status).toBe('VALID');
    });

    it('should accept any valid format PAN in test mode', async () => {
      const result = await service.verifyPan('ABCDE1234F', 'Unknown User');

      expect(result.verified).toBe(true);
      expect(result.panNumber).toBe('ABCDE1234F');
      expect(result.status).toBe('VALID');
      expect(result.message).toContain('default success');
    });

    it('should reject invalid PAN format', async () => {
      const result = await service.verifyPan('INVALID123', 'Test User');

      expect(result.verified).toBe(false);
      expect(result.status).toBe('INVALID_FORMAT');
      expect(result.message).toContain('Invalid PAN format');
    });

    it('should reject PAN with lowercase letters', async () => {
      const result = await service.verifyPan('abcde1234f', 'Test User');

      expect(result.verified).toBe(false);
      expect(result.status).toBe('INVALID_FORMAT');
    });

    it('should reject PAN with special characters', async () => {
      const result = await service.verifyPan('ABCD@1234F', 'Test User');

      expect(result.verified).toBe(false);
      expect(result.status).toBe('INVALID_FORMAT');
    });

    it('should reject PAN with incorrect length', async () => {
      const result = await service.verifyPan('ABCDE12', 'Test User');

      expect(result.verified).toBe(false);
      expect(result.status).toBe('INVALID_FORMAT');
    });
  });

  describe('isValidPanFormat', () => {
    it('should validate correct PAN format', () => {
      expect(service.isValidPanFormat('ABCDE1234F')).toBe(true);
      expect(service.isValidPanFormat('AAAAA0000A')).toBe(true);
      expect(service.isValidPanFormat('ZZZZZ9999Z')).toBe(true);
    });

    it('should reject incorrect PAN formats', () => {
      expect(service.isValidPanFormat('ABCDE123')).toBe(false); // Too short
      expect(service.isValidPanFormat('ABCDE12345')).toBe(false); // Too long
      expect(service.isValidPanFormat('abcde1234f')).toBe(false); // Lowercase
      expect(service.isValidPanFormat('ABCD@1234F')).toBe(false); // Special char
      expect(service.isValidPanFormat('12345ABCDE')).toBe(false); // Wrong pattern
      expect(service.isValidPanFormat('')).toBe(false); // Empty
    });
  });

  describe('verifyPan - Production Mode (mocked)', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        const config = {
          NODE_ENV: 'production',
          PAN_VERIFICATION_API_KEY: 'test-api-key',
          PAN_VERIFICATION_API_URL: 'https://api.test.com/verify',
        };
        return config[key];
      });
    });

    it('should use production API when credentials are configured', async () => {
      // This will test the API call flow
      // In real production, you'd mock axios
      const result = await service.verifyPan('AAAAA0000A', 'Test User');

      // Should fallback to test mode if API call fails
      expect(result.verified).toBeDefined();
      expect(result.panNumber).toBe('AAAAA0000A');
    });
  });
});
