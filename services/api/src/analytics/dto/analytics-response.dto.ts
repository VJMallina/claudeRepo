import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({ example: 15000, description: 'Total savings balance' })
  totalSavings: number;

  @ApiProperty({ example: 50000, description: 'Total investment value' })
  totalInvestments: number;

  @ApiProperty({ example: 5000, description: 'Total returns earned' })
  totalReturns: number;

  @ApiProperty({ example: 10.5, description: 'Overall return percentage' })
  returnPercentage: number;

  @ApiProperty({ example: 3500, description: 'Amount saved this month' })
  thisMonthSavings: number;

  @ApiProperty({ example: 45000, description: 'Total spending this month' })
  thisMonthSpending: number;

  @ApiProperty({ example: 1250, description: 'Amount auto-saved this month' })
  thisMonthAutoSave: number;

  @ApiProperty({ example: 25, description: 'Number of transactions this month' })
  thisMonthTransactions: number;

  @ApiProperty({ example: 3, description: 'Number of active investments' })
  activeInvestments: number;

  @ApiProperty({ example: 2, description: 'Number of active savings goals' })
  activeGoals: number;
}

export class TrendDataPointDto {
  @ApiProperty({ example: '2025-01' })
  period: string;

  @ApiProperty({ example: 3500 })
  value: number;
}

export class CategorySpendingDto {
  @ApiProperty({ example: 'Groceries' })
  category: string;

  @ApiProperty({ example: 5000 })
  amount: number;

  @ApiProperty({ example: 25.5, description: 'Percentage of total spending' })
  percentage: number;

  @ApiProperty({ example: 12 })
  transactionCount: number;
}

export class SavingsTrendDto {
  @ApiProperty({ type: [TrendDataPointDto] })
  monthlyTrend: TrendDataPointDto[];

  @ApiProperty({ example: 12500, description: 'Average monthly savings' })
  averageMonthlySavings: number;

  @ApiProperty({ example: 18000, description: 'Highest month savings' })
  highestMonthSavings: number;

  @ApiProperty({ example: 7500, description: 'Lowest month savings' })
  lowestMonthSavings: number;

  @ApiProperty({ example: 15.5, description: 'Growth rate percentage' })
  growthRate: number;
}

export class InvestmentPerformanceDto {
  @ApiProperty({ type: [TrendDataPointDto] })
  valueTrend: TrendDataPointDto[];

  @ApiProperty({
    example: [
      { category: 'Liquid', invested: 20000, currentValue: 21000, returns: 1000, percentage: 40 },
      { category: 'Equity', invested: 30000, currentValue: 34000, returns: 4000, percentage: 60 },
    ]
  })
  categoryBreakdown: {
    category: string;
    invested: number;
    currentValue: number;
    returns: number;
    percentage: number;
  }[];

  @ApiProperty({ example: 10.5, description: 'Overall return percentage' })
  overallReturns: number;

  @ApiProperty({ example: 5000, description: 'Total profit/loss' })
  totalProfitLoss: number;
}

export class SpendingAnalyticsDto {
  @ApiProperty({ type: [TrendDataPointDto] })
  monthlyTrend: TrendDataPointDto[];

  @ApiProperty({ type: [CategorySpendingDto] })
  categoryBreakdown: CategorySpendingDto[];

  @ApiProperty({ example: 45000, description: 'Average monthly spending' })
  averageMonthlySpending: number;

  @ApiProperty({ example: 55000, description: 'Highest month spending' })
  highestMonthSpending: number;

  @ApiProperty({ example: 35000, description: 'Lowest month spending' })
  lowestMonthSpending: number;

  @ApiProperty({ example: 18500, description: 'This month spending' })
  thisMonthSpending: number;

  @ApiProperty({ example: -8.5, description: 'Change from last month (%)' })
  changeFromLastMonth: number;
}

export class AIInsightDto {
  @ApiProperty({ example: 'savings_milestone' })
  type: string;

  @ApiProperty({ example: 'Savings Milestone Achieved!' })
  title: string;

  @ApiProperty({ example: 'You have saved ₹15,000 this month. Great job!' })
  message: string;

  @ApiProperty({ example: 'positive' })
  sentiment: string;

  @ApiProperty({ example: 'increase_auto_save' })
  actionable?: string;
}

export class AnalyticsDashboardDto {
  @ApiProperty({ type: DashboardSummaryDto })
  summary: DashboardSummaryDto;

  @ApiProperty({ type: SavingsTrendDto })
  savingsTrend: SavingsTrendDto;

  @ApiProperty({ type: InvestmentPerformanceDto })
  investmentPerformance: InvestmentPerformanceDto;

  @ApiProperty({ type: SpendingAnalyticsDto })
  spendingAnalytics: SpendingAnalyticsDto;

  @ApiProperty({ type: [AIInsightDto] })
  insights: AIInsightDto[];
}

export class ComparisonDto {
  @ApiProperty({ example: 'You saved 25% more than last month' })
  savingsComparison: string;

  @ApiProperty({ example: 'You spent 10% less than last month' })
  spendingComparison: string;

  @ApiProperty({ example: 'Your investments grew by 8% this month' })
  investmentComparison: string;

  @ApiProperty({
    example: {
      youSaved: 3500,
      avgUserSaved: 2800,
      percentile: 75,
    }
  })
  peerComparison: {
    youSaved: number;
    avgUserSaved: number;
    percentile: number;
  };
}
