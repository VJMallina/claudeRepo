import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({ example: 'notif-uuid-123' })
  id: string;

  @ApiProperty({ example: 'user-uuid-123' })
  userId: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.TRANSACTION })
  type: NotificationType;

  @ApiProperty({ example: 'Payment Successful' })
  title: string;

  @ApiProperty({ example: 'Your payment of ₹1,000 was successful' })
  message: string;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiPropertyOptional({
    example: { transactionId: 'txn-123', amount: 1000 },
  })
  data?: any;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;
}

export class NotificationsListResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  data: NotificationResponseDto[];

  @ApiProperty({ example: 5, description: 'Number of unread notifications' })
  unreadCount: number;

  @ApiProperty({
    example: {
      total: 100,
      page: 1,
      limit: 20,
      totalPages: 5,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class NotificationPreferencesResponseDto {
  @ApiProperty({ example: true })
  pushNotifications: boolean;

  @ApiProperty({ example: true })
  smsNotifications: boolean;

  @ApiProperty({ example: true })
  emailNotifications: boolean;

  @ApiProperty({ example: true })
  transactionAlerts: boolean;

  @ApiProperty({ example: true })
  savingsAlerts: boolean;

  @ApiProperty({ example: true })
  investmentAlerts: boolean;

  @ApiProperty({ example: true })
  securityAlerts: boolean;

  @ApiProperty({ example: false })
  marketingAlerts: boolean;
}
