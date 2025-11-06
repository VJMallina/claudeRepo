import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import SecurityService, {
  TwoFactorConfig,
  SecuritySession,
  SecurityAlert,
  FailedAttempt,
} from '../security.service';
import apiService from '../api.service';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-local-authentication');
jest.mock('../api.service');

describe('SecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('initialize2FA', () => {
    it('should initialize 2FA and return config with QR code', async () => {
      const mock2FAConfig: TwoFactorConfig = {
        enabled: false,
        method: 'TOTP',
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,iVBORw0KGgo...',
        backupCodes: ['ABC123', 'DEF456', 'GHI789'],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mock2FAConfig);

      const result = await SecurityService.initialize2FA();

      expect(result).toEqual(mock2FAConfig);
      expect(result.secret).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.backupCodes).toHaveLength(3);
      expect(apiService.post).toHaveBeenCalledWith('/auth/2fa/initialize');
    });

    it('should handle initialization errors', async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error('2FA init failed'));

      await expect(SecurityService.initialize2FA()).rejects.toThrow('2FA init failed');
    });
  });

  describe('enable2FA', () => {
    it('should enable 2FA with TOTP method', async () => {
      const mockResponse = {
        success: true,
        backupCodes: ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5'],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.enable2FA('123456', 'TOTP');

      expect(result.success).toBe(true);
      expect(result.backupCodes).toHaveLength(5);
      expect(apiService.post).toHaveBeenCalledWith('/auth/2fa/enable', {
        code: '123456',
        method: 'TOTP',
      });
    });

    it('should enable 2FA with SMS method', async () => {
      const mockResponse = {
        success: true,
        backupCodes: ['CODE1', 'CODE2'],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.enable2FA('123456', 'SMS');

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/auth/2fa/enable', {
        code: '123456',
        method: 'SMS',
      });
    });

    it('should handle invalid verification code', async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid verification code'));

      await expect(SecurityService.enable2FA('000000')).rejects.toThrow(
        'Invalid verification code'
      );
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA with valid code', async () => {
      const mockResponse = { success: true };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.disable2FA('123456');

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/auth/2fa/disable', {
        code: '123456',
      });
    });

    it('should handle invalid code when disabling', async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Invalid code'));

      await expect(SecurityService.disable2FA('000000')).rejects.toThrow('Invalid code');
    });
  });

  describe('verify2FACode', () => {
    it('should verify 2FA code successfully', async () => {
      const mockResponse = {
        success: true,
        token: 'jwt_token_here',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.verify2FACode('123456');

      expect(result.success).toBe(true);
      expect(result.token).toBe('jwt_token_here');
      expect(apiService.post).toHaveBeenCalledWith('/auth/2fa/verify', { code: '123456' });
    });

    it('should handle invalid 2FA code', async () => {
      const mockResponse = {
        success: false,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.verify2FACode('000000');

      expect(result.success).toBe(false);
      expect(result.token).toBeUndefined();
    });
  });

  describe('get2FAStatus', () => {
    it('should get 2FA status when enabled', async () => {
      const mockStatus: TwoFactorConfig = {
        enabled: true,
        method: 'TOTP',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await SecurityService.get2FAStatus();

      expect(result.enabled).toBe(true);
      expect(result.method).toBe('TOTP');
      expect(apiService.get).toHaveBeenCalledWith('/auth/2fa/status');
    });

    it('should get 2FA status when disabled', async () => {
      const mockStatus: TwoFactorConfig = {
        enabled: false,
        method: 'TOTP',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);

      const result = await SecurityService.get2FAStatus();

      expect(result.enabled).toBe(false);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should regenerate backup codes', async () => {
      const mockResponse = {
        backupCodes: ['NEW1', 'NEW2', 'NEW3', 'NEW4', 'NEW5'],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.regenerateBackupCodes('123456');

      expect(result.backupCodes).toHaveLength(5);
      expect(apiService.post).toHaveBeenCalledWith('/auth/2fa/regenerate-backup-codes', {
        code: '123456',
      });
    });
  });

  describe('isBiometricAvailable', () => {
    it('should detect Face ID availability', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);

      const result = await SecurityService.isBiometricAvailable();

      expect(result.available).toBe(true);
      expect(result.biometricType).toBe('FACE_ID');
    });

    it('should detect Fingerprint availability', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      const result = await SecurityService.isBiometricAvailable();

      expect(result.available).toBe(true);
      expect(result.biometricType).toBe('FINGERPRINT');
    });

    it('should detect Iris availability', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.IRIS,
      ]);

      const result = await SecurityService.isBiometricAvailable();

      expect(result.available).toBe(true);
      expect(result.biometricType).toBe('IRIS');
    });

    it('should return unavailable when hardware not present', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([]);

      const result = await SecurityService.isBiometricAvailable();

      expect(result.available).toBe(false);
      expect(result.biometricType).toBe('NONE');
    });

    it('should return unavailable when not enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      const result = await SecurityService.isBiometricAvailable();

      expect(result.available).toBe(false);
    });
  });

  describe('authenticateWithBiometric', () => {
    it('should authenticate successfully', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await SecurityService.authenticateWithBiometric('Verify your identity');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Verify your identity',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
    });

    it('should handle authentication failure', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Authentication failed',
      });

      const result = await SecurityService.authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });

    it('should handle authentication errors', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
        new Error('Biometric error')
      );

      const result = await SecurityService.authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Biometric error');
    });
  });

  describe('getActiveSessions', () => {
    it('should fetch all active sessions', async () => {
      const mockSessions: SecuritySession[] = [
        {
          id: 'session1',
          deviceInfo: {
            platform: 'ios',
            model: 'iPhone 13',
            os: 'iOS 16.0',
          },
          ipAddress: '192.168.1.1',
          location: 'Mumbai, India',
          lastActivity: '2023-12-01T10:00:00Z',
          isCurrentSession: true,
        },
        {
          id: 'session2',
          deviceInfo: {
            platform: 'android',
            model: 'Samsung Galaxy S21',
            os: 'Android 12',
          },
          ipAddress: '192.168.1.2',
          location: 'Delhi, India',
          lastActivity: '2023-11-30T15:00:00Z',
          isCurrentSession: false,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockSessions);

      const result = await SecurityService.getActiveSessions();

      expect(result).toHaveLength(2);
      expect(result[0].isCurrentSession).toBe(true);
      expect(apiService.get).toHaveBeenCalledWith('/auth/sessions');
    });
  });

  describe('terminateSession', () => {
    it('should terminate specific session', async () => {
      const mockResponse = { success: true };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.terminateSession('session2');

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/auth/sessions/session2/terminate');
    });
  });

  describe('terminateAllOtherSessions', () => {
    it('should terminate all other sessions', async () => {
      const mockResponse = {
        success: true,
        terminatedCount: 3,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.terminateAllOtherSessions();

      expect(result.success).toBe(true);
      expect(result.terminatedCount).toBe(3);
      expect(apiService.post).toHaveBeenCalledWith('/auth/sessions/terminate-all');
    });
  });

  describe('getSecurityAlerts', () => {
    it('should fetch security alerts with default limit', async () => {
      const mockAlerts: SecurityAlert[] = [
        {
          id: 'alert1',
          type: 'LOGIN_NEW_DEVICE',
          title: 'New device login',
          description: 'Login from iPhone 13 in Mumbai',
          severity: 'MEDIUM',
          timestamp: '2023-12-01T10:00:00Z',
          acknowledged: false,
        },
        {
          id: 'alert2',
          type: 'PASSWORD_CHANGE',
          title: 'Password changed',
          description: 'Your password was changed',
          severity: 'HIGH',
          timestamp: '2023-11-30T10:00:00Z',
          acknowledged: true,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await SecurityService.getSecurityAlerts();

      expect(result).toHaveLength(2);
      expect(apiService.get).toHaveBeenCalledWith('/auth/security-alerts?limit=20');
    });

    it('should fetch security alerts with custom limit', async () => {
      const mockAlerts: SecurityAlert[] = [];

      (apiService.get as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await SecurityService.getSecurityAlerts(50);

      expect(apiService.get).toHaveBeenCalledWith('/auth/security-alerts?limit=50');
    });

    it('should handle different alert types and severities', async () => {
      const mockAlerts: SecurityAlert[] = [
        {
          id: 'alert1',
          type: 'FAILED_ATTEMPTS',
          title: 'Failed login attempts',
          description: '3 failed attempts detected',
          severity: 'HIGH',
          timestamp: '2023-12-01T10:00:00Z',
          acknowledged: false,
        },
        {
          id: 'alert2',
          type: 'SUSPICIOUS_ACTIVITY',
          title: 'Suspicious activity',
          description: 'Unusual activity detected',
          severity: 'CRITICAL',
          timestamp: '2023-12-01T09:00:00Z',
          acknowledged: false,
        },
        {
          id: 'alert3',
          type: 'LARGE_TRANSACTION',
          title: 'Large transaction',
          description: 'Transaction of ₹50,000',
          severity: 'LOW',
          timestamp: '2023-11-30T10:00:00Z',
          acknowledged: true,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await SecurityService.getSecurityAlerts();

      expect(result).toHaveLength(3);
      expect(result.find(a => a.type === 'CRITICAL')).toBeDefined();
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge alert', async () => {
      const mockResponse = { success: true };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.acknowledgeAlert('alert1');

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/auth/security-alerts/alert1/acknowledge');
    });
  });

  describe('recordFailedPINAttempt', () => {
    it('should record first failed attempt', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await SecurityService.recordFailedPINAttempt();

      expect(result.attemptsRemaining).toBe(2);
      expect(result.lockedUntil).toBeUndefined();
    });

    it('should record second failed attempt', async () => {
      const existingAttempts: FailedAttempt[] = [
        {
          attemptType: 'PIN',
          timestamp: new Date().toISOString(),
          deviceInfo: 'Mobile App',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingAttempts));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await SecurityService.recordFailedPINAttempt();

      expect(result.attemptsRemaining).toBe(1);
      expect(result.lockedUntil).toBeUndefined();
    });

    it('should lock account after 3 failed attempts', async () => {
      const existingAttempts: FailedAttempt[] = [
        {
          attemptType: 'PIN',
          timestamp: new Date().toISOString(),
          deviceInfo: 'Mobile App',
        },
        {
          attemptType: 'PIN',
          timestamp: new Date().toISOString(),
          deviceInfo: 'Mobile App',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingAttempts));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await SecurityService.recordFailedPINAttempt();

      expect(result.attemptsRemaining).toBe(0);
      expect(result.lockedUntil).toBeDefined();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pin_locked_until',
        expect.any(String)
      );
    });

    it('should ignore old failed attempts outside lockout window', async () => {
      const oldDate = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago
      const existingAttempts: FailedAttempt[] = [
        {
          attemptType: 'PIN',
          timestamp: oldDate.toISOString(),
          deviceInfo: 'Mobile App',
        },
        {
          attemptType: 'PIN',
          timestamp: oldDate.toISOString(),
          deviceInfo: 'Mobile App',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingAttempts));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await SecurityService.recordFailedPINAttempt();

      // Old attempts should be ignored, so this is like the first attempt
      expect(result.attemptsRemaining).toBe(2);
    });
  });

  describe('isPINLocked', () => {
    it('should return not locked when no lockout', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await SecurityService.isPINLocked();

      expect(result.locked).toBe(false);
      expect(result.lockedUntil).toBeUndefined();
    });

    it('should return locked when within lockout period', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(futureDate.toISOString());

      const result = await SecurityService.isPINLocked();

      expect(result.locked).toBe(true);
      expect(result.lockedUntil).toBe(futureDate.toISOString());
    });

    it('should clear expired lockout', async () => {
      const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute ago

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(pastDate.toISOString());
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const result = await SecurityService.isPINLocked();

      expect(result.locked).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('pin_locked_until');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('failed_pin_attempts');
    });
  });

  describe('clearFailedAttempts', () => {
    it('should clear all failed attempts', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await SecurityService.clearFailedAttempts();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('failed_pin_attempts');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('pin_locked_until');
    });
  });

  describe('reportSuspiciousActivity', () => {
    it('should report suspicious activity', async () => {
      const mockResponse = { success: true };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.reportSuspiciousActivity(
        'Unauthorized access attempt'
      );

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/auth/report-suspicious', {
        description: 'Unauthorized access attempt',
      });
    });
  });

  describe('changeSecurityPIN', () => {
    it('should change PIN successfully', async () => {
      const mockResponse = { success: true };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SecurityService.changeSecurityPIN('1234', '5678');

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/auth/change-pin', {
        currentPin: '1234',
        newPin: '5678',
      });
    });

    it('should handle incorrect current PIN', async () => {
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Incorrect current PIN'));

      await expect(SecurityService.changeSecurityPIN('0000', '5678')).rejects.toThrow(
        'Incorrect current PIN'
      );
    });
  });

  describe('getSecurityScore', () => {
    it('should return security score with recommendations', async () => {
      const mockScore = {
        score: 75,
        maxScore: 100,
        factors: [
          { name: '2FA Enabled', enabled: true, weight: 30 },
          { name: 'Biometric Auth', enabled: true, weight: 20 },
          { name: 'Strong Password', enabled: true, weight: 25 },
          { name: 'Recent Password Change', enabled: false, weight: 25 },
        ],
        recommendations: [
          'Change your password regularly',
          'Enable email notifications for security alerts',
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockScore);

      const result = await SecurityService.getSecurityScore();

      expect(result.score).toBe(75);
      expect(result.maxScore).toBe(100);
      expect(result.factors).toHaveLength(4);
      expect(result.recommendations).toHaveLength(2);
      expect(apiService.get).toHaveBeenCalledWith('/auth/security-score');
    });

    it('should return low security score when features disabled', async () => {
      const mockScore = {
        score: 25,
        maxScore: 100,
        factors: [
          { name: '2FA Enabled', enabled: false, weight: 30 },
          { name: 'Biometric Auth', enabled: false, weight: 20 },
          { name: 'Strong Password', enabled: true, weight: 25 },
          { name: 'Recent Password Change', enabled: false, weight: 25 },
        ],
        recommendations: [
          'Enable Two-Factor Authentication',
          'Enable Biometric Authentication',
          'Change your password',
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockScore);

      const result = await SecurityService.getSecurityScore();

      expect(result.score).toBe(25);
      expect(result.recommendations.length).toBeGreaterThan(2);
    });
  });

  describe('Complete Security Flow', () => {
    it('should complete 2FA setup flow', async () => {
      // Step 1: Initialize 2FA
      const mockInit: TwoFactorConfig = {
        enabled: false,
        method: 'TOTP',
        secret: 'SECRET123',
        qrCode: 'data:image/png;base64,...',
        backupCodes: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockInit);
      const initResult = await SecurityService.initialize2FA();
      expect(initResult.secret).toBeDefined();

      // Step 2: Enable 2FA
      const mockEnable = {
        success: true,
        backupCodes: ['CODE1', 'CODE2', 'CODE3'],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockEnable);
      const enableResult = await SecurityService.enable2FA('123456');
      expect(enableResult.success).toBe(true);

      // Step 3: Get status
      const mockStatus: TwoFactorConfig = {
        enabled: true,
        method: 'TOTP',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStatus);
      const status = await SecurityService.get2FAStatus();
      expect(status.enabled).toBe(true);
    });

    it('should complete biometric authentication flow', async () => {
      // Step 1: Check availability
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      const availability = await SecurityService.isBiometricAvailable();
      expect(availability.available).toBe(true);

      // Step 2: Authenticate
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const authResult = await SecurityService.authenticateWithBiometric();
      expect(authResult.success).toBe(true);
    });

    it('should complete failed PIN attempt flow with lockout', async () => {
      // Clear any existing data
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Attempt 1
      let result = await SecurityService.recordFailedPINAttempt();
      expect(result.attemptsRemaining).toBe(2);

      // Attempt 2
      const attempts1: FailedAttempt[] = [
        { attemptType: 'PIN', timestamp: new Date().toISOString(), deviceInfo: 'Mobile App' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(attempts1));
      result = await SecurityService.recordFailedPINAttempt();
      expect(result.attemptsRemaining).toBe(1);

      // Attempt 3 - Should lock
      const attempts2: FailedAttempt[] = [
        { attemptType: 'PIN', timestamp: new Date().toISOString(), deviceInfo: 'Mobile App' },
        { attemptType: 'PIN', timestamp: new Date().toISOString(), deviceInfo: 'Mobile App' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(attempts2));
      result = await SecurityService.recordFailedPINAttempt();
      expect(result.attemptsRemaining).toBe(0);
      expect(result.lockedUntil).toBeDefined();

      // Check if locked
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(result.lockedUntil);
      const lockStatus = await SecurityService.isPINLocked();
      expect(lockStatus.locked).toBe(true);
    });
  });
});
