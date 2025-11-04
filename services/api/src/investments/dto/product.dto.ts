import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { RiskLevel } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'HDFC Liquid Fund' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Liquid', description: 'Product category: Liquid, Debt, Equity, Gold' })
  @IsString()
  category: string;

  @ApiProperty({ enum: RiskLevel, example: RiskLevel.LOW })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @ApiProperty({ example: 6.5, description: 'Expected annual return (%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  expectedReturn: number;

  @ApiProperty({ example: 100, description: 'Minimum investment amount' })
  @IsNumber()
  @Min(1)
  minInvestment: number;

  @ApiPropertyOptional({ example: 0.5, description: 'Exit load (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  exitLoad?: number;

  @ApiPropertyOptional({ example: 0.2, description: 'Expense ratio (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  expenseRatio?: number;

  @ApiPropertyOptional({ example: 5000000000, description: 'Total fund size' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fundSize?: number;

  @ApiPropertyOptional({ example: 'Low-risk liquid fund with daily liquidity' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'HDFC Liquid Fund - Direct Plan' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Liquid' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ example: 7.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  expectedReturn?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minInvestment?: number;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  exitLoad?: number;

  @ApiPropertyOptional({ example: 0.25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  expenseRatio?: number;

  @ApiPropertyOptional({ example: 6000000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fundSize?: number;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GetProductsQueryDto {
  @ApiPropertyOptional({ example: 'Liquid' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ example: true, description: 'Filter active products only' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'expectedReturn', description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
