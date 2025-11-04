import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';
import {
  RegisterDto,
  VerifyOtpDto,
  CreateProfileDto,
  SetPinDto,
  LoginWithPinDto,
  RefreshTokenDto,
  ResetPinDto,
} from './dto/auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
    });

    if (existingUser) {
      throw new ConflictException('User with this mobile number already exists');
    }

    // Generate and send OTP
    await this.otpService.generateOtp(dto.mobile, 'REGISTRATION');

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 120, // 2 minutes
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(dto.mobile, dto.code, 'REGISTRATION');

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Generate temporary token for completing registration
    const tempToken = this.jwtService.sign(
      { mobile: dto.mobile, type: 'temp' },
      { expiresIn: '15m' },
    );

    return {
      success: true,
      message: 'OTP verified successfully',
      tempToken,
    };
  }

  async createProfile(mobile: string, dto: CreateProfileDto) {
    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Calculate age
    const age = this.calculateAge(new Date(dto.dob));
    if (age < 18) {
      throw new BadRequestException('You must be at least 18 years old');
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        mobile,
        email: dto.email,
        name: dto.name,
        dob: new Date(dto.dob),
        profilePhoto: dto.profilePhoto,
        pin: '', // Will be set in next step
        kycStatus: 'PENDING',
      },
    });

    // Initialize savings wallet and config
    await Promise.all([
      this.prisma.savingsWallet.create({
        data: { userId: user.id },
      }),
      this.prisma.savingsConfig.create({
        data: { userId: user.id },
      }),
    ]);

    return {
      success: true,
      message: 'Profile created successfully',
      userId: user.id,
    };
  }

  async setPin(userId: string, dto: SetPinDto) {
    // Validate PIN (no sequential or repeated digits)
    if (this.isWeakPin(dto.pin)) {
      throw new BadRequestException('PIN is too weak. Avoid sequential or repeated digits');
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(dto.pin, 10);

    // Update user
    await this.prisma.user.update({
      where: { id: userId },
      data: { pin: hashedPin },
    });

    // Generate tokens
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return this.generateTokens(user);
  }

  async loginWithPin(dto: LoginWithPinDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify PIN
    const isValid = await bcrypt.compare(dto.pin, user.pin);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    return this.generateTokens(user);
  }

  async loginWithOtp(mobile: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate and send OTP
    await this.otpService.generateOtp(mobile, 'LOGIN');

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 120,
    };
  }

  async verifyLoginOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    const isValid = await this.otpService.verifyOtp(dto.mobile, dto.code, 'LOGIN');

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user);
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Find session
      const session = await this.prisma.session.findUnique({
        where: { refreshToken: dto.refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Delete old session
      await this.prisma.session.delete({
        where: { id: session.id },
      });

      // Generate new tokens
      return this.generateTokens(session.user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    // Delete session
    await this.prisma.session.deleteMany({
      where: {
        userId,
        refreshToken,
      },
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async resetPin(dto: ResetPinDto) {
    // Verify OTP
    const isValid = await this.otpService.verifyOtp(dto.mobile, dto.code, 'RESET_PIN');

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate new PIN
    if (this.isWeakPin(dto.newPin)) {
      throw new BadRequestException('PIN is too weak');
    }

    // Hash new PIN
    const hashedPin = await bcrypt.hash(dto.newPin, 10);

    // Update PIN
    await this.prisma.user.update({
      where: { id: user.id },
      data: { pin: hashedPin },
    });

    // Invalidate all sessions
    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return {
      success: true,
      message: 'PIN reset successfully',
    };
  }

  // Helper methods
  private async generateTokens(user: any): Promise<AuthResponseDto> {
    const payload = { sub: user.id, mobile: user.mobile };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRY') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRY') || '7d',
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        mobile: user.mobile,
        email: user.email,
        name: user.name,
        kycStatus: user.kycStatus,
      },
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private isWeakPin(pin: string): boolean {
    // Check for sequential digits (1234, 9876)
    const sequential = /(?:0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/;
    if (sequential.test(pin)) {
      return true;
    }

    // Check for repeated digits (1111, 5555)
    const repeated = /^(\d)\1+$/;
    if (repeated.test(pin)) {
      return true;
    }

    return false;
  }
}
