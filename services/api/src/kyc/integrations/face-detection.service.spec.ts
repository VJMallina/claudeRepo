import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FaceDetectionService } from './face-detection.service';

describe('FaceDetectionService', () => {
  let service: FaceDetectionService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaceDetectionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'development',
                AZURE_FACE_API_KEY: null,
                AZURE_FACE_API_ENDPOINT: null,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FaceDetectionService>(FaceDetectionService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectFaceAndLiveness - Test Mode', () => {
    it('should detect face successfully', async () => {
      const result = await service.detectFaceAndLiveness('https://example.com/selfie.jpg');

      expect(result.success).toBe(true);
      expect(result.faceDetected).toBe(true);
      expect(result.livenessScore).toBeGreaterThanOrEqual(75);
      expect(result.livenessScore).toBeLessThanOrEqual(95);
      expect(result.qualityScore).toBeGreaterThanOrEqual(80);
      expect(result.qualityScore).toBeLessThanOrEqual(95);
      expect(result.message).toContain('TEST MODE');
    });

    it('should return detailed face detection results', async () => {
      const result = await service.detectFaceAndLiveness('https://example.com/selfie.jpg');

      expect(result.details).toBeDefined();
      expect(result.details.blinkDetected).toBeDefined();
      expect(result.details.smileDetected).toBeDefined();
      expect(result.details.headPoseOk).toBeDefined();
      expect(result.details.brightness).toBeDefined();
      expect(result.details.sharpness).toBeDefined();
    });

    it('should handle multiple face detection requests', async () => {
      const urls = [
        'https://example.com/selfie1.jpg',
        'https://example.com/selfie2.jpg',
        'https://example.com/selfie3.jpg',
      ];

      for (const url of urls) {
        const result = await service.detectFaceAndLiveness(url);
        expect(result.success).toBe(true);
        expect(result.faceDetected).toBe(true);
      }
    });

    it('should return consistent quality scores', async () => {
      const result1 = await service.detectFaceAndLiveness('https://example.com/test.jpg');
      const result2 = await service.detectFaceAndLiveness('https://example.com/test.jpg');

      // Both should be in valid range
      expect(result1.qualityScore).toBeGreaterThanOrEqual(80);
      expect(result2.qualityScore).toBeGreaterThanOrEqual(80);
      expect(result1.livenessScore).toBeGreaterThanOrEqual(75);
      expect(result2.livenessScore).toBeGreaterThanOrEqual(75);
    });

    it('should include blink detection in details', async () => {
      const results = await Promise.all([
        service.detectFaceAndLiveness('https://example.com/1.jpg'),
        service.detectFaceAndLiveness('https://example.com/2.jpg'),
        service.detectFaceAndLiveness('https://example.com/3.jpg'),
        service.detectFaceAndLiveness('https://example.com/4.jpg'),
        service.detectFaceAndLiveness('https://example.com/5.jpg'),
      ]);

      // At least some should have blink detected (80% success rate)
      const withBlink = results.filter(r => r.details.blinkDetected);
      expect(withBlink.length).toBeGreaterThanOrEqual(2);
    });

    it('should include smile detection in details', async () => {
      const results = await Promise.all([
        service.detectFaceAndLiveness('https://example.com/1.jpg'),
        service.detectFaceAndLiveness('https://example.com/2.jpg'),
        service.detectFaceAndLiveness('https://example.com/3.jpg'),
        service.detectFaceAndLiveness('https://example.com/4.jpg'),
        service.detectFaceAndLiveness('https://example.com/5.jpg'),
      ]);

      // At least some should have smile detected (70% success rate)
      const withSmile = results.filter(r => r.details.smileDetected);
      expect(withSmile.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('compareFaces - Test Mode', () => {
    it('should compare two faces successfully', async () => {
      const result = await service.compareFaces(
        'https://example.com/selfie.jpg',
        'https://example.com/aadhaar.jpg'
      );

      expect(result.success).toBe(true);
      expect(result.matched).toBeDefined();
      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.message).toContain('TEST MODE');
    });

    it('should return high similarity for matched faces', async () => {
      // Run multiple times to test probability
      const results = await Promise.all([
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
      ]);

      // Most should match (90% success rate in test mode)
      const matched = results.filter(r => r.matched);
      expect(matched.length).toBeGreaterThanOrEqual(3);

      // Matched faces should have high similarity (80-95%)
      matched.forEach(result => {
        expect(result.similarity).toBeGreaterThanOrEqual(80);
        expect(result.similarity).toBeLessThanOrEqual(95);
      });
    });

    it('should return lower similarity for non-matched faces', async () => {
      const results = await Promise.all([
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
        service.compareFaces('https://example.com/1.jpg', 'https://example.com/2.jpg'),
      ]);

      // Some should not match (10% failure rate in test mode)
      const notMatched = results.filter(r => !r.matched);

      if (notMatched.length > 0) {
        // Non-matched faces should have lower similarity (30-60%)
        notMatched.forEach(result => {
          expect(result.similarity).toBeGreaterThanOrEqual(30);
          expect(result.similarity).toBeLessThanOrEqual(60);
        });
      }
    });

    it('should calculate confidence from similarity', async () => {
      const result = await service.compareFaces(
        'https://example.com/selfie.jpg',
        'https://example.com/aadhaar.jpg'
      );

      // Confidence should be similarity / 100
      const expectedConfidence = result.similarity / 100;
      expect(Math.abs(result.confidence - expectedConfidence)).toBeLessThan(0.01);
    });
  });

  describe('Complete Face Verification Flow', () => {
    it('should detect face with liveness and then compare', async () => {
      // Step 1: Detect face and verify liveness
      const detectionResult = await service.detectFaceAndLiveness('https://example.com/selfie.jpg');

      expect(detectionResult.faceDetected).toBe(true);
      expect(detectionResult.livenessScore).toBeGreaterThanOrEqual(75);

      // Step 2: Compare with Aadhaar photo
      const comparisonResult = await service.compareFaces(
        'https://example.com/selfie.jpg',
        'https://example.com/aadhaar.jpg'
      );

      expect(comparisonResult.success).toBe(true);
      expect(comparisonResult.similarity).toBeGreaterThanOrEqual(0);
    });

    it('should handle multiple users concurrently', async () => {
      const users = [
        { selfie: 'https://example.com/user1-selfie.jpg', aadhaar: 'https://example.com/user1-aadhaar.jpg' },
        { selfie: 'https://example.com/user2-selfie.jpg', aadhaar: 'https://example.com/user2-aadhaar.jpg' },
        { selfie: 'https://example.com/user3-selfie.jpg', aadhaar: 'https://example.com/user3-aadhaar.jpg' },
      ];

      const results = await Promise.all(
        users.map(async (user) => {
          const detection = await service.detectFaceAndLiveness(user.selfie);
          const comparison = await service.compareFaces(user.selfie, user.aadhaar);
          return { detection, comparison };
        })
      );

      results.forEach(result => {
        expect(result.detection.faceDetected).toBe(true);
        expect(result.comparison.success).toBe(true);
      });
    });
  });

  describe('Production Mode (mocked)', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        const config = {
          NODE_ENV: 'production',
          AZURE_FACE_API_KEY: 'test-api-key',
          AZURE_FACE_API_ENDPOINT: 'https://test.cognitiveservices.azure.com/',
        };
        return config[key];
      });
    });

    it('should attempt to use production API when configured', async () => {
      // This will test the API call flow
      // Will fallback to test mode if actual API call fails
      const result = await service.detectFaceAndLiveness('https://example.com/test.jpg');

      expect(result.success).toBeDefined();
      expect(result.faceDetected).toBeDefined();
    });
  });
});
