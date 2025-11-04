import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsString,
  IsEnum,
} from 'class-validator';

// Update Savings Configuration DTO
export class UpdateSavingsConfigDto {
  @ApiProperty({
    example: 15,
    description: 'Auto-save percentage (1-50%)',
    minimum: 1,
    maximum: 50,
  })
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsNotEmpty()
  percentage: number;

  @ApiProperty({ example: true, description: 'Enable/disable auto-save' })
  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @ApiPropertyOptional({
    example: 10,
    description: 'Minimum transaction amount for auto-save',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minTransactionAmount?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Maximum auto-save per transaction',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxSavingsPerTransaction?: number;
}

// Withdraw from Savings DTO
export class WithdrawSavingsDto {
  @ApiProperty({ example: 1000, description: 'Amount to withdraw in INR' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    example: 'bank-account-uuid',
    description: 'Bank account ID to withdraw to. If not provided, primary bank account will be used.',
  })
  @IsString()
  @IsOptional()
  bankAccountId?: string;

  @ApiPropertyOptional({
    example: 'Emergency expense',
    description: 'Reason for withdrawal',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

// Manual Deposit DTO
export class DepositSavingsDto {
  @ApiProperty({ example: 500, description: 'Amount to deposit in INR' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    example: 'Extra savings',
    description: 'Description for deposit',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

// Query DTOs
export class GetSavingsTransactionsDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT'],
    description: 'Filter by transaction type',
  })
  @IsString()
  @IsOptional()
  type?: string;
}
