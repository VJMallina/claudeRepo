import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { OnboardingStatusDto, KycRequirementDto } from './dto/onboarding.dto';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get onboarding status',
    description:
      'Get current onboarding progress, KYC level, and permissions for progressive onboarding flow',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved successfully',
    type: OnboardingStatusDto,
  })
  async getOnboardingStatus(@Request() req): Promise<OnboardingStatusDto> {
    return this.onboardingService.getOnboardingStatus(req.user.userId);
  }

  @Get('check-kyc-requirement')
  @ApiOperation({
    summary: 'Check KYC requirement for action',
    description:
      'Check if user meets KYC requirements for payment or investment. Returns required level and next steps.',
  })
  @ApiQuery({
    name: 'action',
    enum: ['PAYMENT', 'INVESTMENT'],
    description: 'Action to check KYC requirement for',
  })
  @ApiQuery({
    name: 'amount',
    required: false,
    description: 'Payment amount (required for PAYMENT action)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'KYC requirement checked',
    type: KycRequirementDto,
  })
  async checkKycRequirement(
    @Request() req,
    @Query('action') action: 'PAYMENT' | 'INVESTMENT',
    @Query('amount', new ParseIntPipe({ optional: true })) amount?: number,
  ): Promise<KycRequirementDto> {
    return this.onboardingService.checkKycRequirement(
      req.user.userId,
      action,
      amount,
    );
  }
}
