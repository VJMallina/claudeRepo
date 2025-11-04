import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Savings Configuration Response
export class SavingsConfigResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 15, description: 'Auto-save percentage' })
  percentage: number;

  @ApiProperty({ example: true, description: 'Is auto-save enabled' })
  enabled: boolean;

  @ApiProperty({ example: 10, description: 'Minimum transaction amount' })
  minTransactionAmount: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Maximum savings per transaction',
  })
  maxSavingsPerTransaction?: number;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  updatedAt: Date;
}

// Savings Wallet Response
export class SavingsWalletResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 5000, description: 'Current balance' })
  balance: number;

  @ApiProperty({ example: 15000, description: 'Total amount saved' })
  totalSaved: number;

  @ApiProperty({ example: 3000, description: 'Total amount withdrawn' })
  totalWithdrawn: number;

  @ApiProperty({ example: 7000, description: 'Total amount invested' })
  totalInvested: number;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  lastUpdated: Date;
}

// Auto-Investment Rule Response
export class AutoInvestRuleResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({
    example: '456e7890-e89b-12d3-a456-426614174000',
    description: 'Investment product ID',
  })
  productId: string;

  @ApiPropertyOptional({ description: 'Product details' })
  product?: {
    id: string;
    name: string;
    category: string;
    riskLevel: string;
    expectedReturn: number;
  };

  @ApiProperty({ example: true, description: 'Is rule enabled' })
  enabled: boolean;

  @ApiProperty({
    example: 'THRESHOLD',
    enum: ['THRESHOLD', 'SCHEDULED'],
    description: 'Trigger type',
  })
  triggerType: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Threshold amount for investment',
  })
  triggerValue?: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Percentage of savings to invest',
  })
  investmentPercentage?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Fixed amount to invest',
  })
  investmentAmount?: number;

  @ApiPropertyOptional({
    example: '0 0 1 * *',
    description: 'Schedule for periodic investment',
  })
  schedule?: string;

  @ApiPropertyOptional({
    example: '2024-01-15T10:00:00.000Z',
    description: 'Last execution timestamp',
  })
  lastExecuted?: Date;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  updatedAt: Date;
}

// List of Auto-Investment Rules
export class AutoInvestRulesListResponseDto {
  @ApiProperty({ type: [AutoInvestRuleResponseDto] })
  rules: AutoInvestRuleResponseDto[];

  @ApiProperty({ example: 3, description: 'Total number of rules' })
  total: number;

  @ApiProperty({
    example: 2,
    description: 'Number of enabled rules',
  })
  activeRules: number;
}

// Auto-Investment Execution Result
export class AutoInvestExecutionResponseDto {
  @ApiProperty({ example: true, description: 'Execution success status' })
  success: boolean;

  @ApiProperty({ example: 'Auto-investment executed successfully' })
  message: string;

  @ApiProperty({
    example: [
      {
        ruleId: '123-456',
        productId: '789-012',
        productName: 'Liquid Fund',
        amountInvested: 1500,
        status: 'SUCCESS',
      },
      {
        ruleId: '456-789',
        productId: '012-345',
        productName: 'Equity Fund',
        amountInvested: 1000,
        status: 'SUCCESS',
      },
    ],
    description: 'Execution results for each rule',
  })
  results: Array<{
    ruleId: string;
    productId: string;
    productName: string;
    amountInvested: number;
    status: string;
    error?: string;
  }>;

  @ApiProperty({ example: 2500, description: 'Total amount invested' })
  totalInvested: number;

  @ApiProperty({ example: 2500, description: 'Remaining savings balance' })
  remainingBalance: number;
}

// Savings Statistics
export class SavingsStatsResponseDto {
  @ApiProperty({ example: 5000, description: 'Current savings balance' })
  currentBalance: number;

  @ApiProperty({ example: 15000, description: 'Total saved via auto-save' })
  totalSaved: number;

  @ApiProperty({ example: 3000, description: 'Total withdrawn' })
  totalWithdrawn: number;

  @ApiProperty({ example: 7000, description: 'Total invested from savings' })
  totalInvested: number;

  @ApiProperty({ example: 15, description: 'Current auto-save percentage' })
  savingsPercentage: number;

  @ApiProperty({ example: 3, description: 'Number of active investment rules' })
  activeInvestmentRules: number;

  @ApiProperty({
    example: {
      'Liquid Fund': 40,
      'Equity Fund': 30,
      'Digital Gold': 30,
    },
    description: 'Investment allocation breakdown',
  })
  investmentAllocation: Record<string, number>;
}
