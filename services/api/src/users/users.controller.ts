import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  @Put('biometric/enable')
  @ApiOperation({ summary: 'Enable biometric authentication' })
  @ApiResponse({ status: 200, description: 'Biometric enabled' })
  async enableBiometric(@Request() req) {
    return this.usersService.enableBiometric(req.user.id);
  }

  @Put('biometric/disable')
  @ApiOperation({ summary: 'Disable biometric authentication' })
  @ApiResponse({ status: 200, description: 'Biometric disabled' })
  async disableBiometric(@Request() req) {
    return this.usersService.disableBiometric(req.user.id);
  }
}
