import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsQueryDto,
} from './dto/product.dto';
import {
  PurchaseInvestmentDto,
  RedeemInvestmentDto,
  GetInvestmentsQueryDto,
  UpdateNavDto,
  GetNavHistoryDto,
} from './dto/investment.dto';
import {
  ProductResponseDto,
  ProductsListResponseDto,
  InvestmentResponseDto,
  InvestmentsListResponseDto,
  PurchaseResponseDto,
  RedemptionResponseDto,
  PortfolioResponseDto,
  NavHistoryResponseDto,
} from './dto/investment-response.dto';
import { InvestmentStatus, TransactionType } from '@prisma/client';

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // PRODUCT CATALOG MANAGEMENT
  // ============================================

  async createProduct(createDto: CreateProductDto): Promise<ProductResponseDto> {
    // Check for duplicate product name
    const existing = await this.prisma.investmentProduct.findFirst({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException('Product with this name already exists');
    }

    const product = await this.prisma.investmentProduct.create({
      data: createDto,
    });

    return this.toProductResponse(product);
  }

  async getProducts(query: GetProductsQueryDto): Promise<ProductsListResponseDto> {
    const {
      category,
      riskLevel,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (category) where.category = category;
    if (riskLevel) where.riskLevel = riskLevel;
    if (isActive !== undefined) where.isActive = isActive;

    const [products, total] = await Promise.all([
      this.prisma.investmentProduct.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          navHistory: {
            orderBy: { date: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.investmentProduct.count({ where }),
    ]);

    const data = products.map((product) => ({
      ...this.toProductResponse(product),
      currentNav: product.navHistory[0]?.nav,
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProduct(productId: string): Promise<ProductResponseDto> {
    const product = await this.prisma.investmentProduct.findUnique({
      where: { id: productId },
      include: {
        navHistory: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Investment product not found');
    }

    return {
      ...this.toProductResponse(product),
      currentNav: product.navHistory[0]?.nav,
    };
  }

  async updateProduct(
    productId: string,
    updateDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.investmentProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Investment product not found');
    }

    const updated = await this.prisma.investmentProduct.update({
      where: { id: productId },
      data: updateDto,
    });

    return this.toProductResponse(updated);
  }

  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    const product = await this.prisma.investmentProduct.findUnique({
      where: { id: productId },
      include: {
        investments: {
          where: { status: InvestmentStatus.ACTIVE },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Investment product not found');
    }

    if (product.investments.length > 0) {
      throw new BadRequestException(
        'Cannot delete product with active investments. Please redeem all investments first.',
      );
    }

    await this.prisma.investmentProduct.delete({
      where: { id: productId },
    });

    return {
      success: true,
      message: 'Investment product deleted successfully',
    };
  }

  // ============================================
  // INVESTMENT PURCHASE & REDEMPTION
  // ============================================

  async purchaseInvestment(
    userId: string,
    purchaseDto: PurchaseInvestmentDto,
  ): Promise<PurchaseResponseDto> {
    const { productId, amount, description } = purchaseDto;

    // Check KYC level - Investments require Level 2 (Full KYC)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.kycLevel < 2) {
      const kycDoc = user.kycDocuments[0];
      const nextSteps: string[] = [];

      if (!kycDoc?.panVerified) {
        nextSteps.push('Verify PAN card');
      }
      if (!kycDoc?.aadhaarVerified) {
        nextSteps.push('Verify Aadhaar');
      }
      if (!kycDoc?.livenessVerified) {
        nextSteps.push('Complete liveness verification');
      }

      throw new BadRequestException({
        message: 'Full KYC required for investments',
        kycRequired: true,
        requiredLevel: 2,
        currentLevel: user.kycLevel,
        nextSteps,
      });
    }

    // Validate product exists and is active
    const product = await this.prisma.investmentProduct.findUnique({
      where: { id: productId },
      include: {
        navHistory: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Investment product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('This investment product is currently inactive');
    }

    if (amount < product.minInvestment) {
      throw new BadRequestException(
        `Minimum investment amount is ₹${product.minInvestment}`,
      );
    }

    // Get current NAV
    const currentNav = product.navHistory[0]?.nav;
    if (!currentNav) {
      throw new BadRequestException('NAV not available for this product');
    }

    // Get user's savings wallet
    const wallet = await this.prisma.savingsWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Savings wallet not found');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException(
        `Insufficient savings balance. Available: ₹${wallet.balance}`,
      );
    }

    // Calculate units
    const units = amount / currentNav;

    // Execute investment atomically
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create investment
      const investment = await prisma.investment.create({
        data: {
          userId,
          productId,
          amountInvested: amount,
          units,
          nav: currentNav,
          currentValue: amount,
          returns: 0,
          status: InvestmentStatus.ACTIVE,
          purchaseDate: new Date(),
        },
        include: {
          product: true,
        },
      });

      // Update savings wallet
      const updatedWallet = await prisma.savingsWallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalInvested: { increment: amount },
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: TransactionType.INVESTMENT,
          amount,
          status: 'SUCCESS',
          description: description || `Investment in ${product.name}`,
          metadata: {
            investmentId: investment.id,
            productId,
            productName: product.name,
            units,
            nav: currentNav,
          },
        },
      });

      return { investment, wallet: updatedWallet, transaction };
    });

    return {
      success: true,
      message: 'Investment purchased successfully',
      investment: this.toInvestmentResponse(result.investment),
      transactionId: result.transaction.id,
      remainingSavingsBalance: result.wallet.balance,
    };
  }

  async redeemInvestment(
    userId: string,
    redeemDto: RedeemInvestmentDto,
  ): Promise<RedemptionResponseDto> {
    const { investmentId, amount, reason } = redeemDto;

    // Get investment details
    const investment = await this.prisma.investment.findUnique({
      where: { id: investmentId },
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

    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    if (investment.userId !== userId) {
      throw new BadRequestException('This investment does not belong to you');
    }

    if (investment.status !== InvestmentStatus.ACTIVE) {
      throw new BadRequestException('Investment is not active');
    }

    // Get current NAV
    const currentNav = investment.product.navHistory[0]?.nav;
    if (!currentNav) {
      throw new BadRequestException('NAV not available for redemption');
    }

    // Calculate current value
    const currentValue = investment.units * currentNav;
    const isFullRedemption = !amount || amount >= currentValue;
    const redemptionAmount = isFullRedemption ? currentValue : amount;

    if (!isFullRedemption && amount > currentValue) {
      throw new BadRequestException(
        `Redemption amount (₹${amount}) exceeds current value (₹${currentValue})`,
      );
    }

    // Calculate units to redeem
    const unitsToRedeem = isFullRedemption
      ? investment.units
      : amount / currentNav;

    // Apply exit load if applicable
    const exitLoadPercentage = investment.product.exitLoad || 0;
    const exitLoadAmount = (redemptionAmount * exitLoadPercentage) / 100;
    const finalRedemptionAmount = redemptionAmount - exitLoadAmount;

    // Execute redemption atomically
    const result = await this.prisma.$transaction(async (prisma) => {
      let updatedInvestment;

      if (isFullRedemption) {
        // Full redemption - mark as redeemed
        updatedInvestment = await prisma.investment.update({
          where: { id: investmentId },
          data: {
            status: InvestmentStatus.REDEEMED,
            redemptionDate: new Date(),
            currentValue: 0,
            returns: currentValue - investment.amountInvested,
          },
          include: { product: true },
        });
      } else {
        // Partial redemption
        const remainingUnits = investment.units - unitsToRedeem;
        const remainingValue = remainingUnits * currentNav;

        updatedInvestment = await prisma.investment.update({
          where: { id: investmentId },
          data: {
            units: remainingUnits,
            currentValue: remainingValue,
            returns: remainingValue - investment.amountInvested,
            status: InvestmentStatus.PARTIAL_REDEEMED,
          },
          include: { product: true },
        });
      }

      // Update savings wallet
      const wallet = await prisma.savingsWallet.update({
        where: { userId },
        data: {
          balance: { increment: finalRedemptionAmount },
          totalWithdrawn: { increment: finalRedemptionAmount },
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: TransactionType.REDEMPTION,
          amount: finalRedemptionAmount,
          status: 'SUCCESS',
          description:
            reason ||
            `${isFullRedemption ? 'Full' : 'Partial'} redemption from ${investment.product.name}`,
          metadata: {
            investmentId,
            productId: investment.productId,
            productName: investment.product.name,
            unitsRedeemed: unitsToRedeem,
            nav: currentNav,
            exitLoad: exitLoadAmount,
            redemptionType: isFullRedemption ? 'FULL' : 'PARTIAL',
          },
        },
      });

      return { updatedInvestment, wallet, transaction };
    });

    return {
      success: true,
      message: `Investment ${isFullRedemption ? 'fully' : 'partially'} redeemed successfully`,
      redeemedAmount: finalRedemptionAmount,
      transactionId: result.transaction.id,
      newSavingsBalance: result.wallet.balance,
      updatedInvestment: isFullRedemption
        ? undefined
        : this.toInvestmentResponse(result.updatedInvestment),
    };
  }

  // ============================================
  // PORTFOLIO MANAGEMENT
  // ============================================

  async getUserInvestments(
    userId: string,
    query: GetInvestmentsQueryDto,
  ): Promise<InvestmentsListResponseDto> {
    const {
      productId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const where: any = { userId };

    if (productId) where.productId = productId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.purchaseDate = {};
      if (startDate) where.purchaseDate.gte = new Date(startDate);
      if (endDate) where.purchaseDate.lte = new Date(endDate);
    }

    const [investments, total] = await Promise.all([
      this.prisma.investment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { purchaseDate: 'desc' },
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
      }),
      this.prisma.investment.count({ where }),
    ]);

    // Update current values based on latest NAV
    const data = investments.map((inv) => {
      const currentNav = inv.product.navHistory[0]?.nav || inv.nav;
      const currentValue = inv.units * currentNav;
      const returns = currentValue - inv.amountInvested;
      const returnPercentage = (returns / inv.amountInvested) * 100;

      return {
        ...this.toInvestmentResponse(inv),
        currentValue,
        returns,
        returnPercentage: parseFloat(returnPercentage.toFixed(2)),
      };
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPortfolio(userId: string): Promise<PortfolioResponseDto> {
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

    if (investments.length === 0) {
      return {
        summary: {
          totalInvested: 0,
          currentValue: 0,
          totalReturns: 0,
          returnPercentage: 0,
          activeInvestments: 0,
          redeemedInvestments: 0,
          breakdown: [],
          topPerformers: [],
        },
        investments: [],
      };
    }

    // Calculate summary
    let totalInvested = 0;
    let currentValue = 0;
    const activeInvestments = investments.filter(
      (inv) => inv.status === InvestmentStatus.ACTIVE,
    ).length;
    const redeemedInvestments = investments.filter(
      (inv) => inv.status === InvestmentStatus.REDEEMED,
    ).length;

    const categoryMap = new Map<string, any>();
    const investmentDetails = [];

    for (const inv of investments) {
      const currentNav = inv.product.navHistory[0]?.nav || inv.nav;
      const invCurrentValue = inv.units * currentNav;
      const invReturns = invCurrentValue - inv.amountInvested;
      const returnPercentage = (invReturns / inv.amountInvested) * 100;

      totalInvested += inv.amountInvested;
      currentValue += invCurrentValue;

      // Category breakdown
      const category = inv.product.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          invested: 0,
          currentValue: 0,
          returns: 0,
        });
      }
      const catData = categoryMap.get(category);
      catData.invested += inv.amountInvested;
      catData.currentValue += invCurrentValue;
      catData.returns += invReturns;

      investmentDetails.push({
        ...this.toInvestmentResponse(inv),
        currentValue: invCurrentValue,
        returns: invReturns,
        returnPercentage: parseFloat(returnPercentage.toFixed(2)),
      });
    }

    const totalReturns = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Category breakdown with percentages
    const breakdown = Array.from(categoryMap.values()).map((cat) => ({
      ...cat,
      percentage: parseFloat(((cat.invested / totalInvested) * 100).toFixed(2)),
    }));

    // Top performers (top 5 by return percentage)
    const topPerformers = investmentDetails
      .sort((a, b) => b.returnPercentage - a.returnPercentage)
      .slice(0, 5)
      .map((inv) => ({
        productName: inv.product.name,
        invested: inv.amountInvested,
        currentValue: inv.currentValue,
        returns: inv.returns,
        returnPercentage: inv.returnPercentage,
      }));

    return {
      summary: {
        totalInvested,
        currentValue,
        totalReturns,
        returnPercentage: parseFloat(returnPercentage.toFixed(2)),
        activeInvestments,
        redeemedInvestments,
        breakdown,
        topPerformers,
      },
      investments: investmentDetails,
    };
  }

  // ============================================
  // NAV MANAGEMENT
  // ============================================

  async updateNav(updateDto: UpdateNavDto): Promise<{ success: boolean; message: string }> {
    const { productId, nav, date } = updateDto;

    const product = await this.prisma.investmentProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Investment product not found');
    }

    const navDate = date ? new Date(date) : new Date();
    navDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Upsert NAV (update if exists for date, create if not)
    await this.prisma.navHistory.upsert({
      where: {
        productId_date: {
          productId,
          date: navDate,
        },
      },
      update: { nav },
      create: {
        productId,
        date: navDate,
        nav,
      },
    });

    return {
      success: true,
      message: 'NAV updated successfully',
    };
  }

  async getNavHistory(query: GetNavHistoryDto): Promise<NavHistoryResponseDto> {
    const { productId, startDate, endDate, days = 30 } = query;

    const product = await this.prisma.investmentProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Investment product not found');
    }

    // Determine date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    const history = await this.prisma.navHistory.findMany({
      where: {
        productId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    if (history.length === 0) {
      throw new NotFoundException('No NAV history found for the specified period');
    }

    // Calculate summary
    const navValues = history.map((h) => h.nav);
    const current = navValues[navValues.length - 1];
    const first = navValues[0];
    const highest = Math.max(...navValues);
    const lowest = Math.min(...navValues);
    const change = current - first;
    const changePercentage = (change / first) * 100;

    return {
      productId,
      history,
      summary: {
        current,
        highest,
        lowest,
        change: parseFloat(change.toFixed(2)),
        changePercentage: parseFloat(changePercentage.toFixed(2)),
      },
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private toProductResponse(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      riskLevel: product.riskLevel,
      expectedReturn: product.expectedReturn,
      minInvestment: product.minInvestment,
      exitLoad: product.exitLoad,
      expenseRatio: product.expenseRatio,
      fundSize: product.fundSize,
      description: product.description,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private toInvestmentResponse(investment: any): InvestmentResponseDto {
    return {
      id: investment.id,
      userId: investment.userId,
      productId: investment.productId,
      amountInvested: investment.amountInvested,
      units: investment.units,
      nav: investment.nav,
      currentValue: investment.currentValue,
      returns: investment.returns,
      returnPercentage: (investment.returns / investment.amountInvested) * 100,
      status: investment.status,
      purchaseDate: investment.purchaseDate,
      redemptionDate: investment.redemptionDate,
      product: investment.product ? this.toProductResponse(investment.product) : undefined,
      createdAt: investment.createdAt,
      updatedAt: investment.updatedAt,
    };
  }
}
