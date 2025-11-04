import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAutoInvestRuleDto,
  UpdateAutoInvestRuleDto,
  ExecuteAutoInvestDto,
} from './dto/auto-invest-rules.dto';
import {
  AutoInvestRuleResponseDto,
  AutoInvestRulesListResponseDto,
  AutoInvestExecutionResponseDto,
} from './dto/savings-response.dto';

@Injectable()
export class AutoInvestRulesService {
  private readonly logger = new Logger(AutoInvestRulesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new auto-investment rule
   */
  async createRule(
    userId: string,
    createDto: CreateAutoInvestRuleDto,
  ): Promise<AutoInvestRuleResponseDto> {
    try {
      this.logger.log(`Creating auto-invest rule for user: ${userId}, product: ${createDto.productId}`);

      // Validate product exists
      const product = await this.prisma.investmentProduct.findUnique({
        where: { id: createDto.productId },
      });

      if (!product) {
        throw new NotFoundException('Investment product not found');
      }

      // Validate that either percentage or amount is provided, not both
      if (createDto.investmentPercentage && createDto.investmentAmount) {
        throw new BadRequestException(
          'Provide either investmentPercentage or investmentAmount, not both',
        );
      }

      if (!createDto.investmentPercentage && !createDto.investmentAmount) {
        throw new BadRequestException(
          'Either investmentPercentage or investmentAmount must be provided',
        );
      }

      // Create rule
      const rule = await this.prisma.autoInvestRule.create({
        data: {
          userId,
          productId: createDto.productId,
          triggerType: createDto.triggerType,
          triggerValue: createDto.triggerValue,
          investmentPercentage: createDto.investmentPercentage,
          investmentAmount: createDto.investmentAmount,
          schedule: createDto.schedule,
          enabled: createDto.enabled !== undefined ? createDto.enabled : true,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              riskLevel: true,
              expectedReturn: true,
            },
          },
        },
      });

      this.logger.log(`Auto-invest rule created: ${rule.id}`);

      return this.mapRuleToResponse(rule);
    } catch (error) {
      this.logger.error(`Failed to create auto-invest rule: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all auto-investment rules for user
   */
  async getUserRules(userId: string): Promise<AutoInvestRulesListResponseDto> {
    try {
      const rules = await this.prisma.autoInvestRule.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              riskLevel: true,
              expectedReturn: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const activeRules = rules.filter((rule) => rule.enabled).length;

      return {
        rules: rules.map((rule) => this.mapRuleToResponse(rule)),
        total: rules.length,
        activeRules,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch auto-invest rules: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get single auto-investment rule
   */
  async getRule(userId: string, ruleId: string): Promise<AutoInvestRuleResponseDto> {
    try {
      const rule = await this.prisma.autoInvestRule.findUnique({
        where: { id: ruleId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              riskLevel: true,
              expectedReturn: true,
            },
          },
        },
      });

      if (!rule) {
        throw new NotFoundException('Auto-invest rule not found');
      }

      if (rule.userId !== userId) {
        throw new UnauthorizedException('Unauthorized to access this rule');
      }

      return this.mapRuleToResponse(rule);
    } catch (error) {
      this.logger.error(`Failed to fetch auto-invest rule: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update auto-investment rule
   */
  async updateRule(
    userId: string,
    ruleId: string,
    updateDto: UpdateAutoInvestRuleDto,
  ): Promise<AutoInvestRuleResponseDto> {
    try {
      this.logger.log(`Updating auto-invest rule: ${ruleId}`);

      // Check ownership
      const existingRule = await this.prisma.autoInvestRule.findUnique({
        where: { id: ruleId },
      });

      if (!existingRule) {
        throw new NotFoundException('Auto-invest rule not found');
      }

      if (existingRule.userId !== userId) {
        throw new UnauthorizedException('Unauthorized to update this rule');
      }

      // Validate that either percentage or amount is provided, not both
      if (updateDto.investmentPercentage && updateDto.investmentAmount) {
        throw new BadRequestException(
          'Provide either investmentPercentage or investmentAmount, not both',
        );
      }

      // Update rule
      const updatedRule = await this.prisma.autoInvestRule.update({
        where: { id: ruleId },
        data: updateDto,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              riskLevel: true,
              expectedReturn: true,
            },
          },
        },
      });

      this.logger.log(`Auto-invest rule updated: ${ruleId}`);

      return this.mapRuleToResponse(updatedRule);
    } catch (error) {
      this.logger.error(`Failed to update auto-invest rule: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete auto-investment rule
   */
  async deleteRule(
    userId: string,
    ruleId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Deleting auto-invest rule: ${ruleId}`);

      // Check ownership
      const rule = await this.prisma.autoInvestRule.findUnique({
        where: { id: ruleId },
      });

      if (!rule) {
        throw new NotFoundException('Auto-invest rule not found');
      }

      if (rule.userId !== userId) {
        throw new UnauthorizedException('Unauthorized to delete this rule');
      }

      // Delete rule
      await this.prisma.autoInvestRule.delete({
        where: { id: ruleId },
      });

      this.logger.log(`Auto-invest rule deleted: ${ruleId}`);

      return {
        success: true,
        message: 'Auto-invest rule deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete auto-invest rule: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Enable/disable auto-investment rule
   */
  async toggleRule(
    userId: string,
    ruleId: string,
    enabled: boolean,
  ): Promise<AutoInvestRuleResponseDto> {
    try {
      this.logger.log(`Toggling auto-invest rule: ${ruleId}, enabled: ${enabled}`);

      // Check ownership
      const rule = await this.prisma.autoInvestRule.findUnique({
        where: { id: ruleId },
      });

      if (!rule) {
        throw new NotFoundException('Auto-invest rule not found');
      }

      if (rule.userId !== userId) {
        throw new UnauthorizedException('Unauthorized to modify this rule');
      }

      // Update rule
      const updatedRule = await this.prisma.autoInvestRule.update({
        where: { id: ruleId },
        data: { enabled },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              riskLevel: true,
              expectedReturn: true,
            },
          },
        },
      });

      this.logger.log(`Auto-invest rule toggled: ${ruleId}, enabled: ${enabled}`);

      return this.mapRuleToResponse(updatedRule);
    } catch (error) {
      this.logger.error(`Failed to toggle auto-invest rule: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Execute auto-investment rules manually or automatically
   */
  async executeAutoInvestment(
    userId: string,
    executeDto?: ExecuteAutoInvestDto,
  ): Promise<AutoInvestExecutionResponseDto> {
    try {
      this.logger.log(`Executing auto-investment for user: ${userId}`);

      // Get savings wallet
      const wallet = await this.prisma.savingsWallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Savings wallet not found');
      }

      if (wallet.balance <= 0) {
        throw new BadRequestException('Insufficient balance in savings wallet');
      }

      // Get rules to execute
      const whereClause: any = {
        userId,
        enabled: true,
      };

      if (executeDto?.ruleIds && executeDto.ruleIds.length > 0) {
        whereClause.id = { in: executeDto.ruleIds };
      }

      const rules = await this.prisma.autoInvestRule.findMany({
        where: whereClause,
        include: {
          product: true,
        },
      });

      if (rules.length === 0) {
        throw new BadRequestException('No active investment rules found');
      }

      // Execute each rule
      const results = [];
      let totalInvested = 0;
      let availableBalance = wallet.balance;

      for (const rule of rules) {
        try {
          // Calculate investment amount
          let amountToInvest = 0;

          if (rule.investmentPercentage) {
            amountToInvest = Math.floor(
              (availableBalance * rule.investmentPercentage) / 100,
            );
          } else if (rule.investmentAmount) {
            amountToInvest = Math.min(rule.investmentAmount, availableBalance);
          }

          // Check minimum investment
          if (amountToInvest < rule.product.minInvestment) {
            results.push({
              ruleId: rule.id,
              productId: rule.productId,
              productName: rule.product.name,
              amountInvested: 0,
              status: 'SKIPPED',
              error: `Amount ${amountToInvest} is below minimum investment ${rule.product.minInvestment}`,
            });
            continue;
          }

          // Execute investment (this will be implemented in Investments Module)
          // For now, we'll update the wallet and create transaction
          await this.prisma.$transaction(async (prisma) => {
            // Update savings wallet
            await prisma.savingsWallet.update({
              where: { userId },
              data: {
                balance: { decrement: amountToInvest },
                totalInvested: { increment: amountToInvest },
              },
            });

            // Create investment transaction
            await prisma.transaction.create({
              data: {
                userId,
                type: 'INVESTMENT',
                amount: amountToInvest,
                status: 'SUCCESS',
                description: `Auto-investment in ${rule.product.name}`,
                metadata: {
                  ruleId: rule.id,
                  productId: rule.productId,
                  autoInvest: true,
                },
              },
            });

            // Update rule last executed
            await prisma.autoInvestRule.update({
              where: { id: rule.id },
              data: { lastExecuted: new Date() },
            });
          });

          availableBalance -= amountToInvest;
          totalInvested += amountToInvest;

          results.push({
            ruleId: rule.id,
            productId: rule.productId,
            productName: rule.product.name,
            amountInvested: amountToInvest,
            status: 'SUCCESS',
          });

          this.logger.log(
            `Invested ${amountToInvest} in ${rule.product.name} for user: ${userId}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to execute rule ${rule.id}: ${error.message}`,
            error.stack,
          );
          results.push({
            ruleId: rule.id,
            productId: rule.productId,
            productName: rule.product.name,
            amountInvested: 0,
            status: 'FAILED',
            error: error.message,
          });
        }
      }

      this.logger.log(`Auto-investment completed: Total invested: ${totalInvested}`);

      return {
        success: true,
        message: 'Auto-investment executed successfully',
        results,
        totalInvested,
        remainingBalance: availableBalance,
      };
    } catch (error) {
      this.logger.error(`Failed to execute auto-investment: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Map AutoInvestRule entity to response DTO
   */
  private mapRuleToResponse(rule: any): AutoInvestRuleResponseDto {
    return {
      id: rule.id,
      productId: rule.productId,
      product: rule.product
        ? {
            id: rule.product.id,
            name: rule.product.name,
            category: rule.product.category,
            riskLevel: rule.product.riskLevel,
            expectedReturn: rule.product.expectedReturn,
          }
        : undefined,
      enabled: rule.enabled,
      triggerType: rule.triggerType,
      triggerValue: rule.triggerValue,
      investmentPercentage: rule.investmentPercentage,
      investmentAmount: rule.investmentAmount,
      schedule: rule.schedule,
      lastExecuted: rule.lastExecuted,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
