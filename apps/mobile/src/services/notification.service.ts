import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api.service';

/**
 * Notification Service
 *
 * Handles Firebase Cloud Messaging (FCM) integration via Expo Notifications
 * Features:
 * - Push notification setup
 * - Device token management
 * - Notification handling
 * - Deep linking support
 * - Local notifications
 * - Notification preferences
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'TRANSACTION' | 'SAVINGS_MILESTONE' | 'INVESTMENT' | 'SECURITY' | 'KYC' | 'GENERAL';
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationPreferences {
  transactionAlerts: boolean;
  savingsMilestones: boolean;
  investmentUpdates: boolean;
  securityAlerts: boolean;
  kycReminders: boolean;
  promotions: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    // Request permissions
    const granted = await this.requestPermissions();

    if (!granted) {
      console.warn('Notification permissions not granted');
      return;
    }

    // Get push token
    await this.registerForPushNotifications();

    // Set up notification listeners
    this.setupNotificationListeners();

    console.log('✅ Notification service initialized');
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return false;
    }

    return true;
  }

  /**
   * Register device for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Get Expo push token
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID || 'your-project-id',
      })).data;

      this.expoPushToken = token;

      // Save token locally
      await AsyncStorage.setItem('expoPushToken', token);

      // Send token to backend
      await this.sendTokenToBackend(token);

      console.log('📱 Push token registered:', token);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Send push token to backend
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      await apiService.post('/notifications/register-device', {
        pushToken: token,
        platform: Platform.OS,
        deviceInfo: {
          brand: Device.brand,
          modelName: Device.modelName,
          osVersion: Device.osVersion,
        },
      });
    } catch (error) {
      console.error('Error sending push token to backend:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle notification received
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { type } = notification.request.content.data;

    // Custom handling based on notification type
    switch (type) {
      case 'TRANSACTION':
        // Play custom sound or vibration
        break;
      case 'SECURITY':
        // High priority alert
        break;
      default:
        break;
    }
  }

  /**
   * Handle notification tap (deep linking)
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { type, screen, params } = response.notification.request.content.data;

    // Navigate to appropriate screen based on notification type
    // This will be called by the navigation service
    // navigationService.navigate(screen, params);

    console.log('Navigate to:', screen, params);
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(data: NotificationData): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
          sound: true,
        },
        trigger: null, // null = send immediately
      });

      return identifier;
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    data: NotificationData,
    triggerDate: Date
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
          sound: true,
        },
        trigger: triggerDate,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const prefs = await apiService.get<NotificationPreferences>('/notifications/preferences');
      return prefs;
    } catch (error) {
      // Return defaults
      return {
        transactionAlerts: true,
        savingsMilestones: true,
        investmentUpdates: true,
        securityAlerts: true,
        kycReminders: true,
        promotions: false,
        emailNotifications: true,
        smsNotifications: true,
        quietHoursEnabled: false,
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await apiService.put('/notifications/preferences', preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiService.post(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Get notification history
   */
  async getHistory(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const response = await apiService.get(
        `/notifications/history?limit=${limit}&offset=${offset}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  }

  /**
   * Test notification (development only)
   */
  async testNotification(): Promise<void> {
    await this.sendLocalNotification({
      type: 'GENERAL',
      title: 'Test Notification',
      body: 'This is a test notification from SaveInvest',
      data: { test: true },
    });
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default new NotificationService();
