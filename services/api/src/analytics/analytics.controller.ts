import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsQueryDto } from './dto/analytics.dto';
import {
  AnalyticsDashboardDto,
  DashboardSummaryDto,
  SavingsTrendDto,
  InvestmentPerformanceDto,
  SpendingAnalyticsDto,
  ComparisonDto,
} from './dto/analytics-response.dto';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get complete dashboard analytics',
    description: 'Get comprehensive dashboard with all analytics data for home screen',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: AnalyticsDashboardDto,
  })
  async getDashboard(@Request() req): Promise<AnalyticsDashboardDto> {
    return this.analyticsService.getDashboard(req.user.userId);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get dashboard summary',
    description: 'Get quick summary statistics for dashboard cards',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary retrieved successfully',
    type: DashboardSummaryDto,
  })
  async getSummary(@Request() req): Promise<DashboardSummaryDto> {
    return this.analyticsService.getDashboardSummary(req.user.userId);
  }

  @Get('savings-trend')
  @ApiOperation({
    summary: 'Get savings trend over time',
    description: 'Get monthly/weekly savings trend with averages and growth rate',
  })
  @ApiResponse({
    status: 200,
    description: 'Savings trend retrieved successfully',
    type: SavingsTrendDto,
  })
  async getSavingsTrend(
    @Request() req,
    @Query() query: GetAnalyticsQueryDto,
  ): Promise<SavingsTrendDto> {
    return this.analyticsService.getSavingsTrend(req.user.userId, query);
  }

  @Get('investment-performance')
  @ApiOperation({
    summary: 'Get investment performance analytics',
    description: 'Get investment portfolio performance with returns and category breakdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Investment performance retrieved successfully',
    type: InvestmentPerformanceDto,
  })
  async getInvestmentPerformance(@Request() req): Promise<InvestmentPerformanceDto> {
    return this.analyticsService.getInvestmentPerformance(req.user.userId);
  }

  @Get('spending-analytics')
  @ApiOperation({
    summary: 'Get spending analytics',
    description: 'Get spending patterns with category breakdown and trends',
  })
  @ApiResponse({
    status: 200,
    description: 'Spending analytics retrieved successfully',
    type: SpendingAnalyticsDto,
  })
  async getSpendingAnalytics(@Request() req): Promise<SpendingAnalyticsDto> {
    return this.analyticsService.getSpendingAnalytics(req.user.userId);
  }

  @Get('comparison')
  @ApiOperation({
    summary: 'Get month-over-month comparison',
    description: 'Compare current month with last month and peer average',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparison data retrieved successfully',
    type: ComparisonDto,
  })
  async getComparison(@Request() req): Promise<ComparisonDto> {
    return this.analyticsService.getComparison(req.user.userId);
  }
}
