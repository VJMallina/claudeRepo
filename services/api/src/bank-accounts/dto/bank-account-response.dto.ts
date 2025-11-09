import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BankAccountResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  userId: string;

  @ApiProperty({ example: '****1234', description: 'Masked account number' })
  accountNumber: string;

  @ApiProperty({ example: 'SBIN0001234' })
  ifscCode: string;

  @ApiProperty({ example: 'John Doe' })
  accountHolderName: string;

  @ApiPropertyOptional({ example: 'State Bank of India' })
  bankName?: string;

  @ApiPropertyOptional({ example: 'Mumbai Main Branch' })
  branchName?: string;

  @ApiProperty({ example: 'SAVINGS' })
  accountType: string;

  @ApiProperty({ example: false })
  isPrimary: boolean;

  @ApiProperty({ example: false })
  verified: boolean;

  @ApiPropertyOptional({ example: 'PENNY_DROP' })
  verificationMethod?: string;

  @ApiPropertyOptional({ example: '2025-01-15T10:30:00Z' })
  verifiedAt?: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;
}

export class VerifyBankAccountResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Bank account verified successfully' })
  message: string;

  @ApiPropertyOptional({ example: 'PENNY_DROP' })
  verificationMethod?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  accountHolderName?: string;

  @ApiPropertyOptional({ example: 'State Bank of India' })
  bankName?: string;
}
