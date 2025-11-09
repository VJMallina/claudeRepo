import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 2;
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async generateOtp(mobile: string, purpose: string): Promise<void> {
    // Generate 6-digit OTP
    const code = this.generateRandomOtp();

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Delete any existing OTPs for this mobile and purpose
    await this.prisma.otp.deleteMany({
      where: {
        mobile,
        purpose,
      },
    });

    // Create new OTP
    await this.prisma.otp.create({
      data: {
        mobile,
        code,
        purpose,
        expiresAt,
        attempts: 0,
        verified: false,
      },
    });

    // Send OTP via SMS (Twilio)
    await this.sendOtpSms(mobile, code);
  }

  async verifyOtp(mobile: string, code: string, purpose: string): Promise<boolean> {
    // Find OTP
    const otp = await this.prisma.otp.findFirst({
      where: {
        mobile,
        purpose,
        code,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      return false;
    }

    // Check if expired
    if (otp.expiresAt < new Date()) {
      return false;
    }

    // Check attempts
    if (otp.attempts >= this.MAX_ATTEMPTS) {
      throw new BadRequestException('Maximum OTP attempts exceeded. Please request a new OTP');
    }

    // Increment attempts
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { attempts: otp.attempts + 1 },
    });

    // Verify code
    if (otp.code !== code) {
      return false;
    }

    // Mark as verified
    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    return true;
  }

  private generateRandomOtp(): string {
    const nodeEnv = this.configService.get('NODE_ENV');

    // Use fixed OTP in development for easy testing
    if (nodeEnv === 'development') {
      return '222222';
    }

    // Generate random 6-digit OTP in production
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpSms(mobile: string, code: string): Promise<void> {
    const twilioAccountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = this.configService.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = this.configService.get('TWILIO_PHONE_NUMBER');
    const nodeEnv = this.configService.get('NODE_ENV');

    // For development/test mode, log OTP to console
    if (nodeEnv === 'development' || !twilioAccountSid || !twilioAuthToken) {
      console.log(`📱 [TEST MODE] OTP for ${mobile}: ${code}`);
      console.log(`   Valid for ${this.OTP_EXPIRY_MINUTES} minutes`);
      console.log(`   Use this code to verify your mobile number`);
      return;
    }

    // Production/Test: Send via Twilio
    try {
      const twilio = require('twilio');
      const client = twilio(twilioAccountSid, twilioAuthToken);

      await client.messages.create({
        body: `Your SaveInvest OTP is: ${code}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`,
        from: twilioPhoneNumber,
        to: `+91${mobile}`,
      });

      console.log(`✅ OTP sent successfully to +91${mobile}`);
    } catch (error) {
      console.error('❌ Error sending OTP via Twilio:', error);

      // Fallback to console in case of Twilio error
      console.log(`📱 [FALLBACK] OTP for ${mobile}: ${code}`);
      console.log(`   Twilio error: ${error.message}`);

      // Don't throw error, allow user to proceed with console OTP
      // throw new BadRequestException('Failed to send OTP. Please try again');
    }
  }

  async cleanupExpiredOtps(): Promise<void> {
    // Delete expired OTPs (run as cron job)
    await this.prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
