import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  RegisterDto,
  VerifyOtpDto,
  CreateProfileDto,
  SetPinDto,
  LoginWithPinDto,
  LoginWithOtpDto,
  RefreshTokenDto,
  ResetPinDto,
} from './dto/auth.dto';
import {
  AuthResponseDto,
  OtpResponseDto,
  VerifyOtpResponseDto,
} from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register new user - Send OTP' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully', type: OtpResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: RegisterDto): Promise<OtpResponseDto> {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP for registration' })
  @ApiResponse({ status: 200, description: 'OTP verified', type: VerifyOtpResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    return this.authService.verifyOtp(dto);
  }

  @Post('create-profile')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user profile after OTP verification' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createProfile(@Request() req, @Body() dto: CreateProfileDto) {
    // Extract mobile from temp token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const decoded = this.authService.decodeToken(token);
    if (!decoded || !decoded.mobile) {
      throw new UnauthorizedException('Invalid token');
    }
    const mobile = decoded.mobile;
    return this.authService.createProfile(mobile, dto);
  }

  @Post('set-pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set PIN for user account' })
  @ApiResponse({ status: 200, description: 'PIN set successfully', type: AuthResponseDto })
  async setPin(@Request() req, @Body() dto: SetPinDto): Promise<AuthResponseDto> {
    // Extract mobile from temp token and find user
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const decoded = this.authService.decodeToken(token);
    if (!decoded || !decoded.mobile) {
      throw new UnauthorizedException('Invalid token');
    }
    const userId = await this.authService.getUserIdByMobile(decoded.mobile);
    return this.authService.setPin(userId, dto);
  }

  @Post('login/pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with mobile and PIN' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginWithPin(@Body() dto: LoginWithPinDto): Promise<AuthResponseDto> {
    return this.authService.loginWithPin(dto);
  }

  @Post('login/otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request OTP for login' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully', type: OtpResponseDto })
  @ApiResponse({ status: 401, description: 'User not found' })
  async loginWithOtp(@Body() dto: LoginWithOtpDto): Promise<OtpResponseDto> {
    return this.authService.loginWithOtp(dto.mobile);
  }

  @Post('login/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP for login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyLoginOtp(@Body() dto: VerifyOtpDto): Promise<AuthResponseDto> {
    return this.authService.verifyLoginOtp(dto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Request() req, @Body() body: { refreshToken: string }) {
    return this.authService.logout(req.user.id, body.refreshToken);
  }

  @Post('reset-pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset PIN using OTP' })
  @ApiResponse({ status: 200, description: 'PIN reset successfully' })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async resetPin(@Body() dto: ResetPinDto) {
    return this.authService.resetPin(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req) {
    return req.user;
  }
}
