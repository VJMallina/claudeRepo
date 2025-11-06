import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import NotificationService, {
  NotificationPreferences,
  ScheduledNotificationData,
} from '../notification.service';
import apiService from '../api.service';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-notifications');
jest.mock('../api.service');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('should request and grant notification permissions', async () => {
      const mockStatus = {
        status: 'granted',
        canAskAgain: true,
      };

      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(mockStatus);

      const result = await NotificationService.requestPermissions();

      expect(result.granted).toBe(true);
      expect(result.canAskAgain).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should handle permission denial', async () => {
      const mockStatus = {
        status: 'denied',
        canAskAgain: false,
      };

      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(mockStatus);

      const result = await NotificationService.requestPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
    });

    it('should handle permission errors', async () => {
      (Notifications.requestPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const result = await NotificationService.requestPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
    });
  });

  describe('hasPermissions', () => {
    it('should return true when permissions are granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await NotificationService.hasPermissions();

      expect(result).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await NotificationService.hasPermissions();

      expect(result).toBe(false);
    });
  });

  describe('registerForPushNotifications', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('should register for push notifications and return token', async () => {
      const mockToken = 'ExponentPushToken[test-token-123]';

      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: mockToken,
      });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      const result = await NotificationService.registerForPushNotifications();

      expect(result).toBe(mockToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('expoPushToken', mockToken);
      expect(apiService.post).toHaveBeenCalledWith('/notifications/register-device', {
        token: mockToken,
        platform: 'ios',
      });
    });

    it('should configure Android notification channel', async () => {
      Platform.OS = 'android';
      const mockToken = 'ExponentPushToken[test-token-123]';

      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: mockToken,
      });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });
      (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue(undefined);

      await NotificationService.registerForPushNotifications();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    });

    it('should handle registration errors', async () => {
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValue(
        new Error('Registration failed')
      );

      const result = await NotificationService.registerForPushNotifications();

      expect(result).toBeNull();
    });
  });

  describe('unregisterForPushNotifications', () => {
    it('should unregister device token from backend', async () => {
      const mockToken = 'ExponentPushToken[test-token-123]';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const result = await NotificationService.unregisterForPushNotifications();

      expect(result).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/notifications/unregister-device', {
        token: mockToken,
      });
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('expoPushToken');
    });

    it('should return false if no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await NotificationService.unregisterForPushNotifications();

      expect(result).toBe(false);
      expect(apiService.post).not.toHaveBeenCalled();
    });

    it('should handle unregistration errors', async () => {
      const mockToken = 'ExponentPushToken[test-token-123]';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Unregister failed'));

      const result = await NotificationService.unregisterForPushNotifications();

      expect(result).toBe(false);
    });
  });

  describe('showLocalNotification', () => {
    it('should show local notification', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');

      await NotificationService.showLocalNotification(
        'Test Title',
        'Test Body',
        { key: 'value' }
      );

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: { key: 'value' },
        },
        trigger: null,
      });
    });

    it('should handle notification errors', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Notification failed')
      );

      // Should not throw
      await expect(
        NotificationService.showLocalNotification('Test', 'Test')
      ).resolves.not.toThrow();
    });
  });

  describe('scheduleNotification', () => {
    it('should schedule notification for specific date', async () => {
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');

      const result = await NotificationService.scheduleNotification(
        'Test Title',
        'Test Body',
        futureDate,
        { key: 'value' }
      );

      expect(result).toBe('notification-id');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: { key: 'value' },
        },
        trigger: { date: futureDate },
      });
    });

    it('should not schedule notification for past date', async () => {
      const pastDate = new Date(Date.now() - 60000); // 1 minute ago

      const result = await NotificationService.scheduleNotification(
        'Test Title',
        'Test Body',
        pastDate
      );

      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should handle scheduling errors', async () => {
      const futureDate = new Date(Date.now() + 60000);
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Schedule failed')
      );

      const result = await NotificationService.scheduleNotification(
        'Test',
        'Test',
        futureDate
      );

      expect(result).toBeNull();
    });
  });

  describe('cancelScheduledNotification', () => {
    it('should cancel scheduled notification', async () => {
      (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);

      await NotificationService.cancelScheduledNotification('notification-id');

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'notification-id'
      );
    });
  });

  describe('cancelAllScheduledNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
        undefined
      );

      await NotificationService.cancelAllScheduledNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('getAllScheduledNotifications', () => {
    it('should return all scheduled notifications', async () => {
      const mockNotifications = [
        {
          identifier: 'notif-1',
          content: { title: 'Test 1', body: 'Body 1', data: {} },
          trigger: { type: 'date', value: Date.now() + 60000 },
        },
        {
          identifier: 'notif-2',
          content: { title: 'Test 2', body: 'Body 2', data: {} },
          trigger: { type: 'date', value: Date.now() + 120000 },
        },
      ];

      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      const result = await NotificationService.getAllScheduledNotifications();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('notif-1');
      expect(result[0].title).toBe('Test 1');
      expect(result[1].id).toBe('notif-2');
    });

    it('should handle notifications without date triggers', async () => {
      const mockNotifications = [
        {
          identifier: 'notif-1',
          content: { title: 'Test 1', body: 'Body 1', data: {} },
          trigger: null,
        },
      ];

      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      const result = await NotificationService.getAllScheduledNotifications();

      expect(result).toHaveLength(1);
      expect(result[0].scheduledDate).toBeUndefined();
    });
  });

  describe('getNotificationPreferences', () => {
    it('should return stored preferences', async () => {
      const mockPreferences: NotificationPreferences = {
        transactionAlerts: true,
        savingsGoals: true,
        securityAlerts: true,
        promotions: false,
        emailNotifications: true,
        smsNotifications: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockPreferences));

      const result = await NotificationService.getNotificationPreferences();

      expect(result).toEqual(mockPreferences);
    });

    it('should return default preferences when none stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await NotificationService.getNotificationPreferences();

      expect(result).toEqual({
        transactionAlerts: true,
        savingsGoals: true,
        securityAlerts: true,
        promotions: true,
        emailNotifications: true,
        smsNotifications: true,
      });
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update preferences locally and on backend', async () => {
      const preferences: NotificationPreferences = {
        transactionAlerts: false,
        savingsGoals: true,
        securityAlerts: true,
        promotions: false,
        emailNotifications: true,
        smsNotifications: false,
      };

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      await NotificationService.updateNotificationPreferences(preferences);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'notification_preferences',
        JSON.stringify(preferences)
      );
      expect(apiService.post).toHaveBeenCalledWith('/notifications/preferences', preferences);
    });

    it('should handle backend update errors gracefully', async () => {
      const preferences: NotificationPreferences = {
        transactionAlerts: true,
        savingsGoals: true,
        securityAlerts: true,
        promotions: true,
        emailNotifications: true,
        smsNotifications: true,
      };

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Backend error'));

      // Should not throw
      await expect(
        NotificationService.updateNotificationPreferences(preferences)
      ).resolves.not.toThrow();

      // Local storage should still be updated
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getBadgeCount', () => {
    it('should return current badge count', async () => {
      (Notifications.getBadgeCountAsync as jest.Mock).mockResolvedValue(5);

      const result = await NotificationService.getBadgeCount();

      expect(result).toBe(5);
    });

    it('should return 0 on error', async () => {
      (Notifications.getBadgeCountAsync as jest.Mock).mockRejectedValue(new Error('Badge error'));

      const result = await NotificationService.getBadgeCount();

      expect(result).toBe(0);
    });
  });

  describe('setBadgeCount', () => {
    it('should set badge count', async () => {
      (Notifications.setBadgeCountAsync as jest.Mock).mockResolvedValue(undefined);

      await NotificationService.setBadgeCount(10);

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(10);
    });
  });

  describe('clearBadge', () => {
    it('should clear badge count', async () => {
      (Notifications.setBadgeCountAsync as jest.Mock).mockResolvedValue(undefined);

      await NotificationService.clearBadge();

      expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0);
    });
  });

  describe('handleNotificationResponse', () => {
    it('should handle deep link navigation', () => {
      const mockNavigation = {
        navigate: jest.fn(),
      };

      const response = {
        notification: {
          request: {
            content: {
              data: {
                screen: 'TransactionHistory',
                params: { id: '123' },
              },
            },
          },
        },
      };

      NotificationService.handleNotificationResponse(response as any, mockNavigation as any);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('TransactionHistory', { id: '123' });
    });

    it('should handle notification without navigation data', () => {
      const mockNavigation = {
        navigate: jest.fn(),
      };

      const response = {
        notification: {
          request: {
            content: {
              data: {},
            },
          },
        },
      };

      NotificationService.handleNotificationResponse(response as any, mockNavigation as any);

      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });
});
