import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import apiService from './api.service';

/**
 * Security Service
 *
 * Handles advanced security features
 * Features:
 * - Two-Factor Authentication (2FA/TOTP)
 * - Biometric authentication
 * - Security alerts
 * - Session management
 * - Failed attempt tracking
 * - Device management
 * - Suspicious activity detection
 */

export interface TwoFactorConfig {
  enabled: boolean;
  method: 'SMS' | 'TOTP' | 'EMAIL';
  secret?: string; // For TOTP
  qrCode?: string; // For TOTP setup
  backupCodes?: string[];
}

export interface SecuritySession {
  id: string;
  deviceInfo: {
    platform: string;
    model: string;
    os: string;
  };
  ipAddress: string;
  location?: string;
  lastActivity: string;
  isCurrentSession: boolean;
}

export interface SecurityAlert {
  id: string;
  type: 'LOGIN_NEW_DEVICE' | 'PASSWORD_CHANGE' | 'FAILED_ATTEMPTS' | 'SUSPICIOUS_ACTIVITY' | 'WITHDRAWAL' | 'LARGE_TRANSACTION';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  acknowledged: boolean;
}

export interface FailedAttempt {
  attemptType: 'PIN' | 'OTP' | 'LOGIN';
  timestamp: string;
  deviceInfo: string;
  ipAddress?: string;
}

class SecurityService {
  private static readonly MAX_PIN_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Initialize 2FA
   */
  async initialize2FA(): Promise<TwoFactorConfig> {
    try {
      const response = await apiService.post<TwoFactorConfig>('/auth/2fa/initialize');
      return response;
    } catch (error) {
      console.error('Error initializing 2FA:', error);
      throw error;
    }
  }

  /**
   * Enable 2FA
   */
  async enable2FA(verificationCode: string, method: 'SMS' | 'TOTP' | 'EMAIL' = 'TOTP'): Promise<{
    success: boolean;
    backupCodes: string[];
  }> {
    try {
      const response = await apiService.post('/auth/2fa/enable', {
        code: verificationCode,
        method,
      });
      return response;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(verificationCode: string): Promise<{ success: boolean }> {
    try {
      return await apiService.post('/auth/2fa/disable', {
        code: verificationCode,
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Verify 2FA code
   */
  async verify2FACode(code: string): Promise<{ success: boolean; token?: string }> {
    try {
      return await apiService.post('/auth/2fa/verify', { code });
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      throw error;
    }
  }

  /**
   * Get 2FA status
   */
  async get2FAStatus(): Promise<TwoFactorConfig> {
    try {
      return await apiService.get<TwoFactorConfig>('/auth/2fa/status');
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      throw error;
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(verificationCode: string): Promise<{ backupCodes: string[] }> {
    try {
      return await apiService.post('/auth/2fa/regenerate-backup-codes', {
        code: verificationCode,
      });
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw error;
    }
  }

  /**
   * Check biometric availability
   */
  async isBiometricAvailable(): Promise<{
    available: boolean;
    biometricType: 'FINGERPRINT' | 'FACE_ID' | 'IRIS' | 'NONE';
  }> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: 'FINGERPRINT' | 'FACE_ID' | 'IRIS' | 'NONE' = 'NONE';

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'FACE_ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'FINGERPRINT';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'IRIS';
      }

      return {
        available: compatible && enrolled,
        biometricType,
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, biometricType: 'NONE' };
    }
  }

  /**
   * Authenticate with biometric
   */
  async authenticateWithBiometric(prompt: string = 'Authenticate to continue'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: prompt,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return {
        success: result.success,
        error: result.error,
      };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<SecuritySession[]> {
    try {
      return await apiService.get<SecuritySession[]>('/auth/sessions');
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string): Promise<{ success: boolean }> {
    try {
      return await apiService.post(`/auth/sessions/${sessionId}/terminate`);
    } catch (error) {
      console.error('Error terminating session:', error);
      throw error;
    }
  }

  /**
   * Terminate all sessions except current
   */
  async terminateAllOtherSessions(): Promise<{ success: boolean; terminatedCount: number }> {
    try {
      return await apiService.post('/auth/sessions/terminate-all');
    } catch (error) {
      console.error('Error terminating sessions:', error);
      throw error;
    }
  }

  /**
   * Get security alerts
   */
  async getSecurityAlerts(limit: number = 20): Promise<SecurityAlert[]> {
    try {
      return await apiService.get<SecurityAlert[]>(`/auth/security-alerts?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      throw error;
    }
  }

  /**
   * Acknowledge security alert
   */
  async acknowledgeAlert(alertId: string): Promise<{ success: boolean }> {
    try {
      return await apiService.post(`/auth/security-alerts/${alertId}/acknowledge`);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }

  /**
   * Record failed PIN attempt
   */
  async recordFailedPINAttempt(): Promise<{
    attemptsRemaining: number;
    lockedUntil?: string;
  }> {
    const key = 'failed_pin_attempts';

    try {
      // Get current attempts
      const attemptsData = await AsyncStorage.getItem(key);
      const attempts: FailedAttempt[] = attemptsData ? JSON.parse(attemptsData) : [];

      // Add new attempt
      attempts.push({
        attemptType: 'PIN',
        timestamp: new Date().toISOString(),
        deviceInfo: 'Mobile App',
      });

      // Keep only last 10 attempts
      const recentAttempts = attempts.slice(-10);

      // Save attempts
      await AsyncStorage.setItem(key, JSON.stringify(recentAttempts));

      // Check if locked
      const recentFailures = recentAttempts.filter(
        a => Date.now() - new Date(a.timestamp).getTime() < SecurityService.LOCKOUT_DURATION
      );

      if (recentFailures.length >= SecurityService.MAX_PIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + SecurityService.LOCKOUT_DURATION);

        // Save lockout time
        await AsyncStorage.setItem('pin_locked_until', lockedUntil.toISOString());

        return {
          attemptsRemaining: 0,
          lockedUntil: lockedUntil.toISOString(),
        };
      }

      return {
        attemptsRemaining: SecurityService.MAX_PIN_ATTEMPTS - recentFailures.length,
      };
    } catch (error) {
      console.error('Error recording failed attempt:', error);
      return { attemptsRemaining: 3 };
    }
  }

  /**
   * Check if PIN is locked
   */
  async isPINLocked(): Promise<{ locked: boolean; lockedUntil?: string }> {
    try {
      const lockedUntil = await AsyncStorage.getItem('pin_locked_until');

      if (!lockedUntil) {
        return { locked: false };
      }

      const unlockTime = new Date(lockedUntil).getTime();

      if (Date.now() >= unlockTime) {
        // Lockout expired
        await AsyncStorage.removeItem('pin_locked_until');
        await AsyncStorage.removeItem('failed_pin_attempts');
        return { locked: false };
      }

      return {
        locked: true,
        lockedUntil,
      };
    } catch (error) {
      console.error('Error checking PIN lock status:', error);
      return { locked: false };
    }
  }

  /**
   * Clear failed attempts (after successful authentication)
   */
  async clearFailedAttempts(): Promise<void> {
    try {
      await AsyncStorage.removeItem('failed_pin_attempts');
      await AsyncStorage.removeItem('pin_locked_until');
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
    }
  }

  /**
   * Report suspicious activity
   */
  async reportSuspiciousActivity(description: string): Promise<{ success: boolean }> {
    try {
      return await apiService.post('/auth/report-suspicious', { description });
    } catch (error) {
      console.error('Error reporting suspicious activity:', error);
      throw error;
    }
  }

  /**
   * Change security PIN
   */
  async changeSecurityPIN(currentPIN: string, newPIN: string): Promise<{ success: boolean }> {
    try {
      return await apiService.post('/auth/change-pin', {
        currentPin: currentPIN,
        newPin: newPIN,
      });
    } catch (error) {
      console.error('Error changing PIN:', error);
      throw error;
    }
  }

  /**
   * Get security score
   */
  async getSecurityScore(): Promise<{
    score: number;
    maxScore: number;
    factors: Array<{
      name: string;
      enabled: boolean;
      weight: number;
    }>;
    recommendations: string[];
  }> {
    try {
      return await apiService.get('/auth/security-score');
    } catch (error) {
      console.error('Error fetching security score:', error);
      throw error;
    }
  }
}

export default new SecurityService();
