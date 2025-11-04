import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingStatusDto, KycRequirementDto } from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async getOnboardingStatus(userId: string): Promise<OnboardingStatusDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycDocuments: true,
        bankAccounts: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kycDoc = user.kycDocuments[0];
    const hasBankAccount = user.bankAccounts.length > 0;

    // Determine completion status
    const completionStatus = {
      profileComplete: Boolean(user.name && user.email && user.mobile),
      pinSetup: Boolean(user.pin),
      biometricEnabled: user.biometricEnabled,
      panVerified: kycDoc?.panVerified || false,
      aadhaarVerified: kycDoc?.aadhaarVerified || false,
      livenessVerified: kycDoc?.livenessVerified || false,
      bankAccountAdded: hasBankAccount,
    };

    // Determine current step
    let currentStep = 'REGISTRATION_COMPLETE';
    if (!completionStatus.profileComplete) {
      currentStep = 'PROFILE_SETUP';
    } else if (!completionStatus.pinSetup) {
      currentStep = 'PIN_SETUP';
    } else if (!completionStatus.biometricEnabled) {
      currentStep = 'BIOMETRIC_SETUP';
    } else if (completionStatus.panVerified && completionStatus.aadhaarVerified && completionStatus.livenessVerified) {
      currentStep = 'KYC_COMPLETE';
    } else {
      currentStep = 'DASHBOARD';
    }

    // Determine next steps
    const nextSteps: string[] = [];
    if (!completionStatus.panVerified && !completionStatus.aadhaarVerified) {
      nextSteps.push('Complete KYC to unlock all features');
    } else if (!completionStatus.panVerified) {
      nextSteps.push('Verify PAN card to unlock higher payment limits');
    } else if (!completionStatus.aadhaarVerified) {
      nextSteps.push('Verify Aadhaar to unlock investments');
    } else if (!completionStatus.livenessVerified) {
      nextSteps.push('Complete liveness check to unlock investments');
    }

    if (!completionStatus.bankAccountAdded) {
      nextSteps.push('Add bank account for withdrawals');
    }

    if (nextSteps.length === 0) {
      nextSteps.push('Onboarding complete! Start saving and investing.');
    }

    // Determine permissions based on KYC level
    const permissions = this.calculatePermissions(user.kycLevel, hasBankAccount);

    return {
      currentStep,
      kycLevel: user.kycLevel,
      kycStatus: user.kycStatus,
      completionStatus,
      nextSteps,
      permissions,
    };
  }

  async checkKycRequirement(
    userId: string,
    action: 'PAYMENT' | 'INVESTMENT',
    amount?: number,
  ): Promise<KycRequirementDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kycDoc = user.kycDocuments[0];
    const currentLevel = user.kycLevel;

    let required = false;
    let requiredLevel = 0;
    let message = '';
    let nextSteps: string[] = [];

    if (action === 'PAYMENT') {
      // Level 0: Payments up to ₹10,000
      // Level 1+: Unlimited payments
      if (amount && amount > 10000 && currentLevel < 1) {
        required = true;
        requiredLevel = 1;
        message = 'KYC Level 1 required for payments above ₹10,000';
        nextSteps = ['Verify PAN card'];
      }
    } else if (action === 'INVESTMENT') {
      // Investments require Level 2 (Full KYC)
      if (currentLevel < 2) {
        required = true;
        requiredLevel = 2;
        message = 'Full KYC required for investments';

        if (!kycDoc?.panVerified) {
          nextSteps.push('Verify PAN card');
        }
        if (!kycDoc?.aadhaarVerified) {
          nextSteps.push('Verify Aadhaar');
        }
        if (!kycDoc?.livenessVerified) {
          nextSteps.push('Complete liveness verification');
        }
      }
    }

    return {
      required,
      requiredLevel,
      currentLevel,
      message,
      nextSteps: nextSteps.length > 0 ? nextSteps : undefined,
    };
  }

  private calculatePermissions(kycLevel: number, hasBankAccount: boolean): any {
    return {
      canMakePayments: true, // Always allowed
      maxPaymentAmount: kycLevel >= 1 ? null : 10000, // null = unlimited
      canInvest: kycLevel >= 2,
      canWithdraw: hasBankAccount,
    };
  }
}
