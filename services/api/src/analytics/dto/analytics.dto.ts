import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export class GetAnalyticsQueryDto {
  @ApiPropertyOptional({ example: '2025-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    example: 'monthly',
    description: 'Aggregation period for trends'
  })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  period?: string;
}
