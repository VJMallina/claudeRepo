import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  Matches,
  Length,
  IsUrl,
} from 'class-validator';

export class VerifyPanDto {
  @ApiProperty({ example: 'ABCDE1234F', description: 'PAN card number' })
  @IsString()
  @Length(10, 10)
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid PAN format. Must be ABCDE1234F format',
  })
  panNumber: string;

  @ApiProperty({ example: 'RAHUL KUMAR', description: 'Name as per PAN' })
  @IsString()
  panName: string;
}

export class VerifyAadhaarDto {
  @ApiProperty({ example: '123456789012', description: '12-digit Aadhaar number' })
  @IsString()
  @Length(12, 12)
  @Matches(/^[0-9]{12}$/, {
    message: 'Invalid Aadhaar number. Must be 12 digits',
  })
  aadhaarNumber: string;
}

export class VerifyAadhaarOtpDto {
  @ApiProperty({ example: '123456', description: 'OTP sent to Aadhaar-linked mobile' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'ref-123-456', description: 'Reference ID from Aadhaar verification request' })
  @IsString()
  referenceId: string;
}

export class UploadDocumentDto {
  @ApiProperty({
    enum: ['PAN', 'AADHAAR_FRONT', 'AADHAAR_BACK', 'SELFIE', 'BANK_STATEMENT', 'CANCELLED_CHEQUE'],
    example: 'PAN'
  })
  @IsEnum(['PAN', 'AADHAAR_FRONT', 'AADHAAR_BACK', 'SELFIE', 'BANK_STATEMENT', 'CANCELLED_CHEQUE'])
  documentType: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/docs/pan_123.jpg' })
  @IsUrl()
  documentUrl: string;
}

export class VerifyBankAccountDto {
  @ApiProperty({ example: '1234567890123456', description: 'Bank account number' })
  @IsString()
  @Length(9, 18)
  accountNumber: string;

  @ApiProperty({ example: 'SBIN0001234', description: '11-character IFSC code' })
  @IsString()
  @Length(11, 11)
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message: 'Invalid IFSC code format',
  })
  ifscCode: string;

  @ApiProperty({ example: 'RAHUL KUMAR', description: 'Account holder name' })
  @IsString()
  accountHolderName: string;
}

export class UpdateKycStatusDto {
  @ApiProperty({
    enum: ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    example: 'APPROVED'
  })
  @IsEnum(['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])
  status: string;

  @ApiPropertyOptional({ example: 'Documents not clear' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class GetKycQueryDto {
  @ApiPropertyOptional({
    enum: ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']
  })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])
  status?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  limit?: number;
}
