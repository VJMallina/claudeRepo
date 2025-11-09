import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiskLevel, InvestmentStatus } from '@prisma/client';

export class ProductResponseDto {
  @ApiProperty({ example: 'product-uuid-123' })
  id: string;

  @ApiProperty({ example: 'HDFC Liquid Fund' })
  name: string;

  @ApiProperty({ example: 'Liquid' })
  category: string;

  @ApiProperty({ enum: RiskLevel, example: RiskLevel.LOW })
  riskLevel: RiskLevel;

  @ApiProperty({ example: 6.5 })
  expectedReturn: number;

  @ApiProperty({ example: 100 })
  minimumInvestment: number;

  @ApiProperty({ example: 0.5 })
  exitLoad: number;

  @ApiPropertyOptional({ example: 0.2 })
  expenseRatio?: number;

  @ApiPropertyOptional({ example: 5000000000 })
  fundSize?: number;

  @ApiPropertyOptional({ example: 'Low-risk liquid fund' })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 1125.50, description: 'Current NAV' })
  currentNav?: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;
}

export class ProductsListResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({
    example: {
      total: 50,
      page: 1,
      limit: 10,
      totalPages: 5,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class InvestmentResponseDto {
  @ApiProperty({ example: 'investment-uuid-123' })
  id: string;

  @ApiProperty({ example: 'user-uuid-123' })
  userId: string;

  @ApiProperty({ example: 'product-uuid-123' })
  productId: string;

  @ApiProperty({ example: 5000 })
  investedAmount: number;

  @ApiProperty({ example: 44.44, description: 'Number of units' })
  units: number;

  @ApiProperty({ example: 1125.50, description: 'NAV at purchase' })
  purchaseNav: number;

  @ApiProperty({ example: 5500, description: 'Current market value' })
  currentValue: number;

  @ApiProperty({ example: 500, description: 'Profit/Loss' })
  returns: number;

  @ApiProperty({ example: 10.0, description: 'Return percentage' })
  returnPercentage: number;

  @ApiProperty({ enum: InvestmentStatus, example: InvestmentStatus.ACTIVE })
  status: InvestmentStatus;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  purchaseDate: Date;

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00Z' })
  redemptionDate?: Date;

  @ApiPropertyOptional({ type: ProductResponseDto })
  fund?: ProductResponseDto;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;
}

export class InvestmentsListResponseDto {
  @ApiProperty({ type: [InvestmentResponseDto] })
  data: InvestmentResponseDto[];

  @ApiProperty({
    example: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PurchaseResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Investment purchased successfully' })
  message: string;

  @ApiProperty({ type: InvestmentResponseDto })
  investment: InvestmentResponseDto;

  @ApiProperty({ example: 'txn-uuid-123', description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ example: 4500, description: 'Remaining savings balance' })
  remainingSavingsBalance: number;
}

export class RedemptionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Investment redeemed successfully' })
  message: string;

  @ApiProperty({ example: 2500, description: 'Amount redeemed' })
  redeemedAmount: number;

  @ApiProperty({ example: 'txn-uuid-123' })
  transactionId: string;

  @ApiProperty({ example: 7000, description: 'New savings balance' })
  newSavingsBalance: number;

  @ApiPropertyOptional({ type: InvestmentResponseDto, description: 'Updated investment (for partial redemption)' })
  updatedInvestment?: InvestmentResponseDto;
}

export class PortfolioSummaryDto {
  @ApiProperty({ example: 50000, description: 'Total amount invested' })
  totalInvested: number;

  @ApiProperty({ example: 55000, description: 'Current market value' })
  currentValue: number;

  @ApiProperty({ example: 5000, description: 'Total profit/loss' })
  totalReturns: number;

  @ApiProperty({ example: 10.0, description: 'Overall return %' })
  returnPercentage: number;

  @ApiProperty({ example: 3, description: 'Number of active investments' })
  activeInvestments: number;

  @ApiProperty({ example: 1, description: 'Number of redeemed investments' })
  redeemedInvestments: number;

  @ApiProperty({
    example: [
      { category: 'Liquid', invested: 20000, currentValue: 21000, percentage: 40 },
      { category: 'Equity', invested: 30000, currentValue: 34000, percentage: 60 },
    ],
    description: 'Portfolio breakdown by category',
  })
  breakdown: {
    category: string;
    invested: number;
    currentValue: number;
    returns: number;
    percentage: number;
  }[];

  @ApiProperty({
    example: [
      { productName: 'HDFC Liquid Fund', invested: 20000, currentValue: 21000, returns: 1000 },
    ],
    description: 'Top performing investments',
  })
  topPerformers: {
    productName: string;
    invested: number;
    currentValue: number;
    returns: number;
    returnPercentage: number;
  }[];
}

export class PortfolioResponseDto {
  @ApiProperty({ type: PortfolioSummaryDto })
  summary: PortfolioSummaryDto;

  @ApiProperty({ type: [InvestmentResponseDto] })
  investments: InvestmentResponseDto[];
}

export class NavResponseDto {
  @ApiProperty({ example: 'nav-uuid-123' })
  id: string;

  @ApiProperty({ example: 'product-uuid-123' })
  productId: string;

  @ApiProperty({ example: '2025-01-01' })
  date: Date;

  @ApiProperty({ example: 1125.50 })
  nav: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;
}

export class NavHistoryResponseDto {
  @ApiProperty({ example: 'product-uuid-123' })
  productId: string;

  @ApiProperty({ type: [NavResponseDto] })
  history: NavResponseDto[];

  @ApiProperty({
    example: {
      current: 1125.50,
      highest: 1150.00,
      lowest: 1100.00,
      change: 25.50,
      changePercentage: 2.32,
    },
  })
  summary: {
    current: number;
    highest: number;
    lowest: number;
    change: number;
    changePercentage: number;
  };
}
