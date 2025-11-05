import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService, AccountSummaryData } from './pdf.service';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class AccountStatementService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  /**
   * Generate daily account statement for a user
   */
  async generateDailyStatement(userId: string, date: Date = new Date()): Promise<Buffer> {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // Fetch user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        mobile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch savings wallet
    const savingsWallet = await this.prisma.savingsWallet.findUnique({
      where: { userId },
    });

    if (!savingsWallet) {
      throw new Error('Savings wallet not found');
    }

    // Fetch today's transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch today's investments
    const investments = await this.prisma.investment.findMany({
      where: {
        userId,
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    // Calculate daily summary
    const totalTransactions = transactions.length;
    const totalSpent = transactions
      .filter((t) => t.type === 'PAYMENT' && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSaved = transactions
      .filter((t) => t.status === 'SUCCESS')
      .reduce((sum, t) => sum + (t.autoSaveAmount || 0), 0);
    const totalInvested = investments.reduce(
      (sum, inv) => sum + inv.amountInvested,
      0
    );

    // Prepare data for PDF
    const statementData: AccountSummaryData = {
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
      date,
      savingsWallet: {
        balance: savingsWallet.balance,
        totalSaved: savingsWallet.totalSaved,
        totalWithdrawn: savingsWallet.totalWithdrawn,
        totalInvested: savingsWallet.totalInvested,
      },
      transactions: transactions.map((txn) => ({
        id: txn.id,
        type: txn.type,
        amount: txn.amount,
        status: txn.status,
        description: txn.description || 'N/A',
        createdAt: txn.createdAt,
        autoSaveAmount: txn.autoSaveAmount,
      })),
      investments: investments.map((inv) => ({
        id: inv.id,
        productName: inv.product.name,
        amountInvested: inv.amountInvested,
        units: inv.units,
        nav: inv.nav,
        purchaseDate: inv.purchaseDate,
      })),
      summary: {
        totalTransactions,
        totalSpent,
        totalSaved,
        totalInvested,
      },
    };

    // Generate PDF
    return this.pdfService.generateAccountStatement(statementData);
  }

  /**
   * Generate monthly account statement
   */
  async generateMonthlyStatement(
    userId: string,
    year: number,
    month: number
  ): Promise<Buffer> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Fetch user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        mobile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Fetch savings wallet
    const savingsWallet = await this.prisma.savingsWallet.findUnique({
      where: { userId },
    });

    if (!savingsWallet) {
      throw new Error('Savings wallet not found');
    }

    // Fetch month's transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch month's investments
    const investments = await this.prisma.investment.findMany({
      where: {
        userId,
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    // Calculate monthly summary
    const totalTransactions = transactions.length;
    const totalSpent = transactions
      .filter((t) => t.type === 'PAYMENT' && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSaved = transactions
      .filter((t) => t.status === 'SUCCESS')
      .reduce((sum, t) => sum + (t.autoSaveAmount || 0), 0);
    const totalInvested = investments.reduce(
      (sum, inv) => sum + inv.amountInvested,
      0
    );

    // Prepare data for PDF
    const statementData: AccountSummaryData = {
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
      date: startDate,
      savingsWallet: {
        balance: savingsWallet.balance,
        totalSaved: savingsWallet.totalSaved,
        totalWithdrawn: savingsWallet.totalWithdrawn,
        totalInvested: savingsWallet.totalInvested,
      },
      transactions: transactions.map((txn) => ({
        id: txn.id,
        type: txn.type,
        amount: txn.amount,
        status: txn.status,
        description: txn.description || 'N/A',
        createdAt: txn.createdAt,
        autoSaveAmount: txn.autoSaveAmount,
      })),
      investments: investments.map((inv) => ({
        id: inv.id,
        productName: inv.product.name,
        amountInvested: inv.amountInvested,
        units: inv.units,
        nav: inv.nav,
        purchaseDate: inv.purchaseDate,
      })),
      summary: {
        totalTransactions,
        totalSpent,
        totalSaved,
        totalInvested,
      },
    };

    // Generate PDF
    return this.pdfService.generateAccountStatement(statementData);
  }

  /**
   * Check if user has any activity for the day
   */
  async hasActivityToday(userId: string, date: Date = new Date()): Promise<boolean> {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const transactionCount = await this.prisma.transaction.count({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const investmentCount = await this.prisma.investment.count({
      where: {
        userId,
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return transactionCount > 0 || investmentCount > 0;
  }

  /**
   * Get all users who need daily statements
   */
  async getUsersForDailyStatements(date: Date = new Date()): Promise<string[]> {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // Get users who had transactions today
    const usersWithTransactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'SUCCESS',
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    // Get users who made investments today
    const usersWithInvestments = await this.prisma.investment.findMany({
      where: {
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    // Combine and deduplicate
    const userIds = [
      ...new Set([
        ...usersWithTransactions.map((u) => u.userId),
        ...usersWithInvestments.map((u) => u.userId),
      ]),
    ];

    return userIds;
  }
}
