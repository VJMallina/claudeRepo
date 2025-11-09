import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import {
  CreateNotificationDto,
  UpdateNotificationPreferencesDto,
  GetNotificationsQueryDto,
  MarkAsReadDto,
} from './dto/notification.dto';
import {
  NotificationResponseDto,
  NotificationsListResponseDto,
  NotificationPreferencesResponseDto,
} from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  // Store preferences in memory (in production, use database)
  private userPreferences = new Map<string, any>();

  constructor(private prisma: PrismaService) {}

  // ============================================
  // NOTIFICATION CRUD
  // ============================================

  async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.create({
      data: createDto,
    });

    // Send push notification if preferences allow
    await this.sendPushNotification(createDto.userId, notification);

    return this.toNotificationResponse(notification);
  }

  async getUserNotifications(
    userId: string,
    query: GetNotificationsQueryDto,
  ): Promise<NotificationsListResponseDto> {
    const { type, isRead, page = 1, limit = 20 } = query;

    const where: any = { userId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications.map(this.toNotificationResponse),
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(userId: string, markDto: MarkAsReadDto): Promise<{ success: boolean; count: number }> {
    const { notificationIds } = markDto;

    const result = await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId, // Ensure user owns these notifications
      },
      data: { isRead: true },
    });

    return {
      success: true,
      count: result.count,
    };
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean; count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      success: true,
      count: result.count,
    };
  }

  async deleteNotification(userId: string, notificationId: string): Promise<{ success: boolean }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  // ============================================
  // PREFERENCES
  // ============================================

  async getPreferences(userId: string): Promise<NotificationPreferencesResponseDto> {
    const prefs = this.userPreferences.get(userId) || this.getDefaultPreferences();
    return prefs;
  }

  async updatePreferences(
    userId: string,
    updateDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    const current = this.userPreferences.get(userId) || this.getDefaultPreferences();
    const updated = { ...current, ...updateDto };
    this.userPreferences.set(userId, updated);
    return updated;
  }

  // ============================================
  // NOTIFICATION TRIGGERS
  // ============================================

  async notifyPaymentSuccess(userId: string, amount: number, transactionId: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.TRANSACTION,
      title: 'Payment Successful',
      message: `Your payment of ₹${amount.toLocaleString()} was successful`,
      data: { transactionId, amount, type: 'payment' },
    });
  }

  async notifyAutoSave(userId: string, amount: number, savingsBalance: number): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.SAVINGS,
      title: 'Auto-Save Applied',
      message: `₹${amount.toLocaleString()} saved automatically. Total savings: ₹${savingsBalance.toLocaleString()}`,
      data: { amount, savingsBalance, type: 'auto_save' },
    });
  }

  async notifyInvestmentPurchase(
    userId: string,
    productName: string,
    amount: number,
    investmentId: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.INVESTMENT,
      title: 'Investment Successful',
      message: `You invested ₹${amount.toLocaleString()} in ${productName}`,
      data: { investmentId, productName, amount, type: 'investment_purchase' },
    });
  }

  async notifyAutoInvestment(
    userId: string,
    totalInvested: number,
    ruleCount: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.INVESTMENT,
      title: 'Auto-Investment Executed',
      message: `₹${totalInvested.toLocaleString()} invested automatically across ${ruleCount} products`,
      data: { totalInvested, ruleCount, type: 'auto_investment' },
    });
  }

  async notifyGoalMilestone(
    userId: string,
    goalName: string,
    progress: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.GOAL,
      title: 'Goal Milestone Reached',
      message: `You've reached ${progress}% of your ${goalName} goal!`,
      data: { goalName, progress, type: 'goal_milestone' },
    });
  }

  async notifySecurityAlert(userId: string, message: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.SECURITY,
      title: 'Security Alert',
      message,
      data: { type: 'security_alert' },
    });
  }

  // ============================================
  // PUSH NOTIFICATION INTEGRATION
  // ============================================

  private async sendPushNotification(userId: string, notification: any): Promise<void> {
    const prefs = await this.getPreferences(userId);

    if (!prefs.pushNotifications) return;

    // Check if user wants this type of notification
    const typeAllowed = this.isNotificationTypeAllowed(notification.type, prefs);
    if (!typeAllowed) return;

    // TODO: Integrate with Firebase Cloud Messaging
    // const fcmToken = await this.getUserFCMToken(userId);
    // await this.sendFCM(fcmToken, notification);

    console.log(`[PUSH] User: ${userId}, Title: ${notification.title}`);
  }

  private isNotificationTypeAllowed(type: NotificationType, prefs: any): boolean {
    const mapping = {
      [NotificationType.TRANSACTION]: prefs.transactionAlerts,
      [NotificationType.SAVINGS]: prefs.savingsAlerts,
      [NotificationType.INVESTMENT]: prefs.investmentAlerts,
      [NotificationType.SECURITY]: prefs.securityAlerts,
      [NotificationType.GOAL]: prefs.savingsAlerts,
      [NotificationType.SYSTEM]: true,
    };

    return mapping[type] !== false;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getDefaultPreferences(): NotificationPreferencesResponseDto {
    return {
      pushNotifications: true,
      smsNotifications: true,
      emailNotifications: true,
      transactionAlerts: true,
      savingsAlerts: true,
      investmentAlerts: true,
      securityAlerts: true,
      marketingAlerts: false,
    };
  }

  private toNotificationResponse(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.isRead,
      data: notification.data,
      createdAt: notification.createdAt,
    };
  }
}
