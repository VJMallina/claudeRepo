import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus } from '@prisma/client';

export class KycDocumentResponseDto {
  @ApiProperty({ example: 'kyc-doc-uuid-123' })
  id: string;

  @ApiProperty({ example: 'user-uuid-123' })
  userId: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  panNumber?: string;

  @ApiPropertyOptional({ example: 'RAHUL KUMAR' })
  panName?: string;

  @ApiProperty({ example: false })
  panVerified: boolean;

  @ApiPropertyOptional({ example: '************9012' })
  aadhaarNumber?: string;

  @ApiProperty({ example: false })
  aadhaarVerified: boolean;

  @ApiPropertyOptional({ example: '1234567890123456' })
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'SBIN0001234' })
  bankIfsc?: string;

  @ApiPropertyOptional({ example: 'RAHUL KUMAR' })
  bankAccountName?: string;

  @ApiProperty({ example: false })
  bankVerified: boolean;

  @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/selfie.jpg' })
  selfieUrl?: string;

  @ApiProperty({ example: false })
  faceMatched: boolean;

  @ApiPropertyOptional({ example: 'Documents not clear' })
  rejectionReason?: string;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;
}

export class KycStatusResponseDto {
  @ApiProperty({ example: 'user-uuid-123' })
  userId: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.APPROVED })
  kycStatus: KycStatus;

  @ApiProperty({ example: 75, description: 'KYC completion percentage' })
  completionPercentage: number;

  @ApiProperty({
    example: {
      panVerified: true,
      aadhaarVerified: true,
      bankVerified: false,
      selfieVerified: false,
    },
  })
  verificationStatus: {
    panVerified: boolean;
    aadhaarVerified: boolean;
    bankVerified: boolean;
    selfieVerified: boolean;
  };

  @ApiProperty({
    example: ['Upload selfie', 'Verify bank account'],
    description: 'Next steps to complete KYC',
  })
  nextSteps: string[];

  @ApiPropertyOptional({ type: KycDocumentResponseDto })
  kycDocument?: KycDocumentResponseDto;
}

export class PanVerificationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'PAN verified successfully' })
  message: string;

  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({ example: 'ABCDE1234F' })
  panNumber: string;

  @ApiProperty({ example: 'RAHUL KUMAR' })
  panName: string;

  @ApiPropertyOptional({ example: '01/01/1990' })
  dob?: string;
}

export class AadhaarVerificationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'OTP sent to Aadhaar-linked mobile' })
  message: string;

  @ApiProperty({ example: 'ref-123-456' })
  referenceId: string;

  @ApiProperty({ example: 120, description: 'OTP validity in seconds' })
  expiresIn: number;
}

export class AadhaarOtpVerificationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Aadhaar verified successfully' })
  message: string;

  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({ example: '************9012' })
  aadhaarNumber: string;

  @ApiPropertyOptional({
    example: {
      name: 'Rahul Kumar',
      dob: '01/01/1990',
      gender: 'M',
      address: 'Mumbai, Maharashtra',
    },
  })
  aadhaarData?: {
    name: string;
    dob: string;
    gender: string;
    address: string;
  };
}

export class BankVerificationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Bank account verified successfully' })
  message: string;

  @ApiProperty({ example: true })
  verified: boolean;

  @ApiProperty({ example: '1234567890123456' })
  accountNumber: string;

  @ApiProperty({ example: 'SBIN0001234' })
  ifscCode: string;

  @ApiProperty({ example: 'RAHUL KUMAR' })
  accountHolderName: string;

  @ApiProperty({ example: 'State Bank of India' })
  bankName: string;

  @ApiPropertyOptional({ example: 'Mumbai Main Branch' })
  branchName?: string;
}

export class DocumentUploadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Document uploaded successfully' })
  message: string;

  @ApiProperty({ example: 'PAN' })
  documentType: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/docs/pan_123.jpg' })
  documentUrl: string;

  @ApiPropertyOptional({ example: 95, description: 'Document quality score' })
  qualityScore?: number;
}

export class KycListResponseDto {
  @ApiProperty({ type: [KycStatusResponseDto] })
  data: KycStatusResponseDto[];

  @ApiProperty({
    example: {
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
