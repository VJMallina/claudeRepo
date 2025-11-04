import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-uuid-123' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.TRANSACTION })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'Payment Successful' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your payment of ₹1,000 was successful' })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    example: { transactionId: 'txn-123', amount: 1000 },
    description: 'Additional data for the notification',
  })
  @IsOptional()
  @IsObject()
  data?: any;
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  transactionAlerts?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  savingsAlerts?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  investmentAlerts?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  securityAlerts?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  marketingAlerts?: boolean;
}

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  limit?: number;
}

export class MarkAsReadDto {
  @ApiProperty({ example: ['notif-1', 'notif-2'] })
  @IsString({ each: true })
  notificationIds: string[];
}
