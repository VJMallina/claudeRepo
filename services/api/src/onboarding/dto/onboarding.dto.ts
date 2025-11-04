import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardingStatusDto {
  @ApiProperty({ example: 'PROFILE_COMPLETE' })
  currentStep: string;

  @ApiProperty({ example: 0, description: 'KYC Level: 0 (None), 1 (PAN), 2 (Full)' })
  kycLevel: number;

  @ApiProperty({ example: 'PENDING' })
  kycStatus: string;

  @ApiProperty({
    example: {
      profileComplete: true,
      pinSetup: true,
      biometricEnabled: true,
      panVerified: false,
      aadhaarVerified: false,
      livenessVerified: false,
      bankAccountAdded: false,
    },
  })
  completionStatus: {
    profileComplete: boolean;
    pinSetup: boolean;
    biometricEnabled: boolean;
    panVerified: boolean;
    aadhaarVerified: boolean;
    livenessVerified: boolean;
    bankAccountAdded: boolean;
  };

  @ApiProperty({
    example: [
      'Add bank account for withdrawals',
      'Complete KYC to unlock investments',
    ],
  })
  nextSteps: string[];

  @ApiProperty({
    example: {
      canMakePayments: true,
      maxPaymentAmount: 10000,
      canInvest: false,
      canWithdraw: false,
    },
  })
  permissions: {
    canMakePayments: boolean;
    maxPaymentAmount: number;
    canInvest: boolean;
    canWithdraw: boolean;
  };
}

export class KycRequirementDto {
  @ApiProperty({ example: true })
  required: boolean;

  @ApiProperty({ example: 1, description: 'Required KYC level' })
  requiredLevel: number;

  @ApiProperty({ example: 0, description: 'Current KYC level' })
  currentLevel: number;

  @ApiProperty({ example: 'KYC Level 1 required for payments above ₹10,000' })
  message: string;

  @ApiPropertyOptional({
    example: ['Verify PAN card'],
    description: 'Steps needed to meet KYC requirement',
  })
  nextSteps?: string[];
}
