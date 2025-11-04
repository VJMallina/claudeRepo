import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAnalyticsQueryDto } from './dto/analytics.dto';
import {
  AnalyticsDashboardDto,
  DashboardSummaryDto,
  SavingsTrendDto,
  InvestmentPerformanceDto,
  SpendingAnalyticsDto,
  AIInsightDto,
  ComparisonDto,
} from './dto/analytics-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // DASHBOARD ANALYTICS
  // ============================================

  async getDashboard(userId: string): Promise<AnalyticsDashboardDto> {
    const [summary, savingsTrend, investmentPerformance, spendingAnalytics] =
      await Promise.all([
        this.getDashboardSummary(userId),
        this.getSavingsTrend(userId),
        this.getInvestmentPerformance(userId),
        this.getSpendingAnalytics(userId),
      ]);

    const insights = await this.generateInsights(userId, summary);

    return {
      summary,
      savingsTrend,
      investmentPerformance,
      spendingAnalytics,
      insights,
    };
  }

  async getDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get savings wallet
    const savingsWallet = await this.prisma.savingsWallet.findUnique({
      where: { userId },
    });

    // Get investment portfolio summary
    const investments = await this.prisma.investment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        product: {
          include: {
            navHistory: {
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    let totalInvestments = 0;
    let totalInvested = 0;
    for (const inv of investments) {
      const currentNav = inv.product.navHistory[0]?.nav || inv.nav;
      const currentValue = inv.units * currentNav;
      totalInvestments += currentValue;
      totalInvested += inv.amountInvested;
    }

    const totalReturns = totalInvestments - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // This month stats
    const thisMonthTransactions = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: { in: ['DEPOSIT', 'PAYMENT'] },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true, autoSaveAmount: true },
      _count: { id: true },
    });

    const thisMonthSavings = thisMonthTransactions._sum.amount || 0;
    const thisMonthAutoSave = thisMonthTransactions._sum.autoSaveAmount || 0;

    // Get spending (payments)
    const thisMonthPayments = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'PAYMENT',
        status: 'SUCCESS',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: { amount: true },
    });

    const thisMonthSpending = thisMonthPayments._sum.amount || 0;

    // Get active goals count
    const activeGoals = await this.prisma.goal.count({
      where: { userId, status: 'ACTIVE' },
    });

    return {
      totalSavings: savingsWallet?.balance || 0,
      totalInvestments,
      totalReturns,
      returnPercentage: parseFloat(returnPercentage.toFixed(2)),
      thisMonthSavings,
      thisMonthSpending,
      thisMonthAutoSave,
      thisMonthTransactions: thisMonthTransactions._count.id,
      activeInvestments: investments.length,
      activeGoals,
    };
  }

  async getSavingsTrend(userId: string, query?: GetAnalyticsQueryDto): Promise<SavingsTrendDto> {
    const endDate = query?.endDate ? new Date(query.endDate) : new Date();
    const startDate = query?.startDate
      ? new Date(query.startDate)
      : new Date(endDate.getTime() - 180 * 24 * 60 * 60 * 1000); // 6 months

    // Get monthly savings data
    const monthlyData = await this.getMonthlyAggregation(
      userId,
      startDate,
      endDate,
      ['DEPOSIT'],
    );

    const monthlyTrend = monthlyData.map((d) => ({
      period: `${d.year}-${String(d.month).padStart(2, '0')}`,
      value: d.total,
    }));

    const values = monthlyData.map((d) => d.total);
    const averageMonthlySavings = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    const highestMonthSavings = Math.max(...values, 0);
    const lowestMonthSavings = Math.min(...values.filter((v) => v > 0), 0);

    // Calculate growth rate (last month vs first month)
    const growthRate =
      values.length >= 2 && values[0] > 0
        ? ((values[values.length - 1] - values[0]) / values[0]) * 100
        : 0;

    return {
      monthlyTrend,
      averageMonthlySavings: parseFloat(averageMonthlySavings.toFixed(2)),
      highestMonthSavings,
      lowestMonthSavings,
      growthRate: parseFloat(growthRate.toFixed(2)),
    };
  }

  async getInvestmentPerformance(userId: string): Promise<InvestmentPerformanceDto> {
    const investments = await this.prisma.investment.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            navHistory: {
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    // Calculate current values
    let totalInvested = 0;
    let totalCurrentValue = 0;
    const categoryMap = new Map<string, any>();

    for (const inv of investments) {
      const currentNav = inv.product.navHistory[0]?.nav || inv.nav;
      const currentValue = inv.units * currentNav;

      totalInvested += inv.amountInvested;
      totalCurrentValue += currentValue;

      const category = inv.product.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          invested: 0,
          currentValue: 0,
          returns: 0,
          percentage: 0,
        });
      }

      const cat = categoryMap.get(category);
      cat.invested += inv.amountInvested;
      cat.currentValue += currentValue;
      cat.returns += currentValue - inv.amountInvested;
    }

    // Calculate percentages
    const categoryBreakdown = Array.from(categoryMap.values()).map((cat) => ({
      ...cat,
      percentage: totalInvested > 0 ? (cat.invested / totalInvested) * 100 : 0,
    }));

    const totalProfitLoss = totalCurrentValue - totalInvested;
    const overallReturns = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // Mock value trend (in production, track historical portfolio values)
    const valueTrend = this.mockPortfolioValueTrend(totalInvested, totalCurrentValue);

    return {
      valueTrend,
      categoryBreakdown,
      overallReturns: parseFloat(overallReturns.toFixed(2)),
      totalProfitLoss,
    };
  }

  async getSpendingAnalytics(userId: string): Promise<SpendingAnalyticsDto> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 180 * 24 * 60 * 60 * 1000); // 6 months

    // Get monthly spending
    const monthlyData = await this.getMonthlyAggregation(
      userId,
      startDate,
      endDate,
      ['PAYMENT'],
    );

    const monthlyTrend = monthlyData.map((d) => ({
      period: `${d.year}-${String(d.month).padStart(2, '0')}`,
      value: d.total,
    }));

    const values = monthlyData.map((d) => d.total);
    const averageMonthlySpending = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    const highestMonthSpending = Math.max(...values, 0);
    const lowestMonthSpending = Math.min(...values.filter((v) => v > 0), 0);

    const thisMonthSpending = values[values.length - 1] || 0;
    const lastMonthSpending = values[values.length - 2] || 0;
    const changeFromLastMonth =
      lastMonthSpending > 0
        ? ((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100
        : 0;

    // Category breakdown (mock - in production, categorize transactions)
    const categoryBreakdown = [
      { category: 'Food & Dining', amount: thisMonthSpending * 0.3, percentage: 30, transactionCount: 15 },
      { category: 'Shopping', amount: thisMonthSpending * 0.25, percentage: 25, transactionCount: 8 },
      { category: 'Transportation', amount: thisMonthSpending * 0.2, percentage: 20, transactionCount: 12 },
      { category: 'Entertainment', amount: thisMonthSpending * 0.15, percentage: 15, transactionCount: 5 },
      { category: 'Others', amount: thisMonthSpending * 0.1, percentage: 10, transactionCount: 10 },
    ];

    return {
      monthlyTrend,
      categoryBreakdown,
      averageMonthlySpending: parseFloat(averageMonthlySpending.toFixed(2)),
      highestMonthSpending,
      lowestMonthSpending,
      thisMonthSpending,
      changeFromLastMonth: parseFloat(changeFromLastMonth.toFixed(2)),
    };
  }

  async getComparison(userId: string): Promise<ComparisonDto> {
    const now = new Date();
    const thisMonth = { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
    const lastMonth = {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0),
    };

    // This month savings
    const thisMonthSavings = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'DEPOSIT',
        createdAt: { gte: thisMonth.start, lte: thisMonth.end },
      },
      _sum: { amount: true },
    });

    // Last month savings
    const lastMonthSavings = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'DEPOSIT',
        createdAt: { gte: lastMonth.start, lte: lastMonth.end },
      },
      _sum: { amount: true },
    });

    const thisSavings = thisMonthSavings._sum.amount || 0;
    const lastSavings = lastMonthSavings._sum.amount || 0;
    const savingsChange =
      lastSavings > 0 ? ((thisSavings - lastSavings) / lastSavings) * 100 : 0;

    // Spending comparison
    const thisMonthSpending = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'PAYMENT',
        createdAt: { gte: thisMonth.start, lte: thisMonth.end },
      },
      _sum: { amount: true },
    });

    const lastMonthSpending = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'PAYMENT',
        createdAt: { gte: lastMonth.start, lte: lastMonth.end },
      },
      _sum: { amount: true },
    });

    const thisSpending = thisMonthSpending._sum.amount || 0;
    const lastSpending = lastMonthSpending._sum.amount || 0;
    const spendingChange =
      lastSpending > 0 ? ((thisSpending - lastSpending) / lastSpending) * 100 : 0;

    // Investment growth (mock for now)
    const investmentGrowth = 8.5;

    // Peer comparison (mock - would need platform-wide aggregations)
    const avgUserSaved = 2800;
    const percentile = thisSavings > avgUserSaved ? 75 : 45;

    return {
      savingsComparison: `You saved ${Math.abs(savingsChange).toFixed(1)}% ${savingsChange >= 0 ? 'more' : 'less'} than last month`,
      spendingComparison: `You spent ${Math.abs(spendingChange).toFixed(1)}% ${spendingChange >= 0 ? 'more' : 'less'} than last month`,
      investmentComparison: `Your investments grew by ${investmentGrowth}% this month`,
      peerComparison: {
        youSaved: thisSavings,
        avgUserSaved,
        percentile,
      },
    };
  }

  // ============================================
  // AI INSIGHTS GENERATION
  // ============================================

  private async generateInsights(userId: string, summary: DashboardSummaryDto): Promise<AIInsightDto[]> {
    const insights: AIInsightDto[] = [];

    // Savings milestone
    if (summary.thisMonthSavings >= 5000) {
      insights.push({
        type: 'savings_milestone',
        title: 'Savings Milestone Achieved!',
        message: `You've saved ₹${summary.thisMonthSavings.toLocaleString()} this month. Excellent progress!`,
        sentiment: 'positive',
        actionable: 'consider_investment',
      });
    }

    // High returns
    if (summary.returnPercentage > 10) {
      insights.push({
        type: 'investment_performance',
        title: 'Great Investment Returns',
        message: `Your investments are up ${summary.returnPercentage.toFixed(1)}% overall. Keep it up!`,
        sentiment: 'positive',
      });
    }

    // Low auto-save
    if (summary.thisMonthAutoSave < summary.thisMonthSavings * 0.1) {
      insights.push({
        type: 'auto_save_suggestion',
        title: 'Increase Auto-Save',
        message: 'Consider increasing your auto-save percentage to grow your savings faster.',
        sentiment: 'neutral',
        actionable: 'increase_auto_save',
      });
    }

    // High spending
    if (summary.thisMonthSpending > summary.thisMonthSavings * 2) {
      insights.push({
        type: 'spending_alert',
        title: 'High Spending Alert',
        message: 'Your spending is significantly higher than your savings this month.',
        sentiment: 'warning',
        actionable: 'review_spending',
      });
    }

    return insights;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async getMonthlyAggregation(
    userId: string,
    startDate: Date,
    endDate: Date,
    types: string[],
  ): Promise<Array<{ year: number; month: number; total: number }>> {
    // Get transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: { in: types as any },
        status: 'SUCCESS',
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyMap = new Map<string, number>();

    for (const txn of transactions) {
      const year = txn.createdAt.getFullYear();
      const month = txn.createdAt.getMonth() + 1;
      const key = `${year}-${month}`;

      monthlyMap.set(key, (monthlyMap.get(key) || 0) + txn.amount);
    }

    // Convert to array
    const result: Array<{ year: number; month: number; total: number }> = [];
    for (const [key, total] of monthlyMap.entries()) {
      const [year, month] = key.split('-').map(Number);
      result.push({ year, month, total });
    }

    return result.sort((a, b) => a.year - b.year || a.month - b.month);
  }

  private mockPortfolioValueTrend(invested: number, currentValue: number): Array<{ period: string; value: number }> {
    const months = 6;
    const trend: Array<{ period: string; value: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Linear growth from invested to currentValue
      const progress = (months - i) / months;
      const value = invested + (currentValue - invested) * progress;

      trend.push({ period, value: parseFloat(value.toFixed(2)) });
    }

    return trend;
  }
}
