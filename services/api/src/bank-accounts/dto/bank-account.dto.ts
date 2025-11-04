import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Matches,
  Length,
} from 'class-validator';

export enum BankAccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
}

export class AddBankAccountDto {
  @ApiProperty({ example: '1234567890123456', description: 'Bank account number' })
  @IsString()
  @IsNotEmpty()
  @Length(9, 18)
  accountNumber: string;

  @ApiProperty({ example: 'SBIN0001234', description: 'IFSC code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message: 'Invalid IFSC code format',
  })
  ifscCode: string;

  @ApiProperty({ example: 'John Doe', description: 'Account holder name (as per bank)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  accountHolderName: string;

  @ApiPropertyOptional({ enum: BankAccountType, default: BankAccountType.SAVINGS })
  @IsEnum(BankAccountType)
  @IsOptional()
  accountType?: BankAccountType;

  @ApiPropertyOptional({ example: 'State Bank of India' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: 'Mumbai Main Branch' })
  @IsString()
  @IsOptional()
  branchName?: string;
}

export class UpdateBankAccountDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  accountHolderName?: string;

  @ApiPropertyOptional({ enum: BankAccountType })
  @IsEnum(BankAccountType)
  @IsOptional()
  accountType?: BankAccountType;

  @ApiPropertyOptional({ example: 'State Bank of India' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: 'Mumbai Main Branch' })
  @IsString()
  @IsOptional()
  branchName?: string;
}
