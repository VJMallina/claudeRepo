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
  IsUUID,
  ValidateIf,
} from 'class-validator';

export enum TriggerTypeEnum {
  THRESHOLD = 'THRESHOLD', // When savings reach X amount
  SCHEDULED = 'SCHEDULED', // Monthly/weekly on date
}

// Create Auto-Investment Rule DTO
export class CreateAutoInvestRuleDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Investment product ID',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    enum: TriggerTypeEnum,
    example: TriggerTypeEnum.THRESHOLD,
    description: 'When to trigger investment',
  })
  @IsEnum(TriggerTypeEnum)
  @IsNotEmpty()
  triggerType: TriggerTypeEnum;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Threshold amount (for THRESHOLD trigger type)',
  })
  @IsNumber()
  @Min(100)
  @IsOptional()
  @ValidateIf((o) => o.triggerType === TriggerTypeEnum.THRESHOLD)
  triggerValue?: number;

  @ApiPropertyOptional({
    example: '0 0 1 * *',
    description: 'Cron expression for scheduled investment (for SCHEDULED type)',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.triggerType === TriggerTypeEnum.SCHEDULED)
  schedule?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Percentage of savings to invest (1-100%)',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  investmentPercentage?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Fixed amount to invest (alternative to percentage)',
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  investmentAmount?: number;

  @ApiProperty({
    example: true,
    description: 'Enable/disable this rule',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

// Update Auto-Investment Rule DTO
export class UpdateAutoInvestRuleDto {
  @ApiPropertyOptional({
    enum: TriggerTypeEnum,
    description: 'When to trigger investment',
  })
  @IsEnum(TriggerTypeEnum)
  @IsOptional()
  triggerType?: TriggerTypeEnum;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Threshold amount (for THRESHOLD trigger type)',
  })
  @IsNumber()
  @Min(100)
  @IsOptional()
  triggerValue?: number;

  @ApiPropertyOptional({
    example: '0 0 1 * *',
    description: 'Cron expression for scheduled investment',
  })
  @IsString()
  @IsOptional()
  schedule?: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Percentage of savings to invest',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  investmentPercentage?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Fixed amount to invest',
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  investmentAmount?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Enable/disable this rule',
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

// Execute Auto-Investment DTO (for manual trigger)
export class ExecuteAutoInvestDto {
  @ApiPropertyOptional({
    example: ['rule-id-1', 'rule-id-2'],
    description: 'Specific rule IDs to execute (optional, executes all if not provided)',
  })
  @IsUUID(undefined, { each: true })
  @IsOptional()
  ruleIds?: string[];
}
