import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsEnum,
  Min,
  IsDateString,
} from 'class-validator';
import { InvestmentStatus } from '@prisma/client';

export class PurchaseInvestmentDto {
  @ApiProperty({ example: 'product-uuid-123', description: 'Investment fund ID' })
  @IsUUID()
  fundId: string;

  @ApiProperty({ example: 5000, description: 'Amount to invest in rupees' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'Investment for retirement goal' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class RedeemInvestmentDto {
  @ApiProperty({ example: 'investment-uuid-123', description: 'Investment ID to redeem' })
  @IsUUID()
  investmentId: string;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Amount to redeem (leave empty for full redemption)'
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({ example: 'Partial redemption for emergency' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class GetInvestmentsQueryDto {
  @ApiPropertyOptional({ example: 'product-uuid-123' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ enum: InvestmentStatus })
  @IsOptional()
  @IsEnum(InvestmentStatus)
  status?: InvestmentStatus;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class UpdateNavDto {
  @ApiProperty({ example: 'product-uuid-123' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1125.50, description: 'Net Asset Value' })
  @IsNumber()
  @Min(0)
  nav: number;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'NAV date (defaults to today)' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class GetNavHistoryDto {
  @ApiProperty({ example: 'product-uuid-123' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 30, default: 30, description: 'Number of days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Min(365)
  days?: number;
}
