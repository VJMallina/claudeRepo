import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import {
  UpdateNotificationPreferencesDto,
  GetNotificationsQueryDto,
  MarkAsReadDto,
} from './dto/notification.dto';
import {
  NotificationsListResponseDto,
  NotificationPreferencesResponseDto,
} from './dto/notification-response.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Get paginated list of notifications with filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: NotificationsListResponseDto,
  })
  async getNotifications(
    @Request() req,
    @Query() query: GetNotificationsQueryDto,
  ): Promise<NotificationsListResponseDto> {
    return this.notificationsService.getUserNotifications(req.user.userId, query);
  }

  @Put('mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notifications as read',
    description: 'Mark one or more notifications as read',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read',
  })
  async markAsRead(
    @Request() req,
    @Body() markDto: MarkAsReadDto,
  ): Promise<{ success: boolean; count: number }> {
    return this.notificationsService.markAsRead(req.user.userId, markDto);
  }

  @Put('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  async markAllAsRead(@Request() req): Promise<{ success: boolean; count: number }> {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Delete a specific notification',
  })
  @ApiParam({ name: 'notificationId', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async deleteNotification(
    @Request() req,
    @Param('notificationId') notificationId: string,
  ): Promise<{ success: boolean }> {
    return this.notificationsService.deleteNotification(req.user.userId, notificationId);
  }

  @Get('preferences')
  @ApiOperation({
    summary: 'Get notification preferences',
    description: 'Get user notification preferences for all channels',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences retrieved successfully',
    type: NotificationPreferencesResponseDto,
  })
  async getPreferences(@Request() req): Promise<NotificationPreferencesResponseDto> {
    return this.notificationsService.getPreferences(req.user.userId);
  }

  @Put('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update notification preferences',
    description: 'Update notification preferences for push, SMS, email, and alert types',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    type: NotificationPreferencesResponseDto,
  })
  async updatePreferences(
    @Request() req,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    return this.notificationsService.updatePreferences(req.user.userId, updateDto);
  }
}
