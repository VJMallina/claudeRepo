import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SavingsService } from './savings.service';
import { AutoInvestRulesService } from './auto-invest-rules.service';
import {
  UpdateSavingsConfigDto,
  WithdrawSavingsDto,
  DepositSavingsDto,
  GetSavingsTransactionsDto,
} from './dto/savings-config.dto';
import {
  CreateAutoInvestRuleDto,
  UpdateAutoInvestRuleDto,
  ExecuteAutoInvestDto,
} from './dto/auto-invest-rules.dto';
import {
  SavingsConfigResponseDto,
  SavingsWalletResponseDto,
  SavingsStatsResponseDto,
  AutoInvestRuleResponseDto,
  AutoInvestRulesListResponseDto,
  AutoInvestExecutionResponseDto,
} from './dto/savings-response.dto';
import { TransactionListResponseDto } from '../payments/dto/payment-response.dto';

@ApiTags('savings')
@Controller('savings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavingsController {
  constructor(
    private readonly savingsService: SavingsService,
    private readonly autoInvestRulesService: AutoInvestRulesService,
  ) {}

  // ========== Savings Configuration Endpoints ==========

  @Get('config')
  @ApiOperation({ summary: 'Get auto-save configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    type: SavingsConfigResponseDto,
  })
  async getSavingsConfig(@Request() req): Promise<SavingsConfigResponseDto> {
    return this.savingsService.getSavingsConfig(req.user.id);
  }

  @Put('config')
  @ApiOperation({ summary: 'Update auto-save configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
    type: SavingsConfigResponseDto,
  })
  async updateSavingsConfig(
    @Request() req,
    @Body() updateDto: UpdateSavingsConfigDto,
  ): Promise<SavingsConfigResponseDto> {
    return this.savingsService.updateSavingsConfig(req.user.id, updateDto);
  }

  // ========== Savings Wallet Endpoints ==========

  @Get('wallet')
  @ApiOperation({ summary: 'Get savings wallet balance' })
  @ApiResponse({
    status: 200,
    description: 'Wallet retrieved successfully',
    type: SavingsWalletResponseDto,
  })
  async getSavingsWallet(@Request() req): Promise<SavingsWalletResponseDto> {
    return this.savingsService.getSavingsWallet(req.user.id);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw from savings wallet' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal successful',
  })
  async withdrawSavings(
    @Request() req,
    @Body() withdrawDto: WithdrawSavingsDto,
  ): Promise<{ success: boolean; message: string; newBalance: number }> {
    return this.savingsService.withdrawSavings(req.user.id, withdrawDto);
  }

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manual deposit to savings wallet' })
  @ApiResponse({
    status: 200,
    description: 'Deposit successful',
  })
  async depositSavings(
    @Request() req,
    @Body() depositDto: DepositSavingsDto,
  ): Promise<{ success: boolean; message: string; newBalance: number }> {
    return this.savingsService.depositSavings(req.user.id, depositDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get savings-related transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT'],
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: TransactionListResponseDto,
  })
  async getSavingsTransactions(
    @Request() req,
    @Query() query: GetSavingsTransactionsDto,
  ): Promise<TransactionListResponseDto> {
    return this.savingsService.getSavingsTransactions(req.user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get savings statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: SavingsStatsResponseDto,
  })
  async getSavingsStats(@Request() req): Promise<SavingsStatsResponseDto> {
    return this.savingsService.getSavingsStats(req.user.id);
  }

  // ========== Auto-Investment Rules Endpoints ==========

  @Get('auto-invest/rules')
  @ApiOperation({ summary: 'Get all auto-investment rules' })
  @ApiResponse({
    status: 200,
    description: 'Rules retrieved successfully',
    type: AutoInvestRulesListResponseDto,
  })
  async getAutoInvestRules(@Request() req): Promise<AutoInvestRulesListResponseDto> {
    return this.autoInvestRulesService.getUserRules(req.user.id);
  }

  @Post('auto-invest/rules')
  @ApiOperation({ summary: 'Create new auto-investment rule' })
  @ApiResponse({
    status: 201,
    description: 'Rule created successfully',
    type: AutoInvestRuleResponseDto,
  })
  async createAutoInvestRule(
    @Request() req,
    @Body() createDto: CreateAutoInvestRuleDto,
  ): Promise<AutoInvestRuleResponseDto> {
    return this.autoInvestRulesService.createRule(req.user.id, createDto);
  }

  @Get('auto-invest/rules/:id')
  @ApiOperation({ summary: 'Get single auto-investment rule' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule retrieved successfully',
    type: AutoInvestRuleResponseDto,
  })
  async getAutoInvestRule(
    @Request() req,
    @Param('id') id: string,
  ): Promise<AutoInvestRuleResponseDto> {
    return this.autoInvestRulesService.getRule(req.user.id, id);
  }

  @Put('auto-invest/rules/:id')
  @ApiOperation({ summary: 'Update auto-investment rule' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule updated successfully',
    type: AutoInvestRuleResponseDto,
  })
  async updateAutoInvestRule(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateAutoInvestRuleDto,
  ): Promise<AutoInvestRuleResponseDto> {
    return this.autoInvestRulesService.updateRule(req.user.id, id, updateDto);
  }

  @Delete('auto-invest/rules/:id')
  @ApiOperation({ summary: 'Delete auto-investment rule' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule deleted successfully',
  })
  async deleteAutoInvestRule(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.autoInvestRulesService.deleteRule(req.user.id, id);
  }

  @Put('auto-invest/rules/:id/enable')
  @ApiOperation({ summary: 'Enable auto-investment rule' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule enabled successfully',
    type: AutoInvestRuleResponseDto,
  })
  async enableAutoInvestRule(
    @Request() req,
    @Param('id') id: string,
  ): Promise<AutoInvestRuleResponseDto> {
    return this.autoInvestRulesService.toggleRule(req.user.id, id, true);
  }

  @Put('auto-invest/rules/:id/disable')
  @ApiOperation({ summary: 'Disable auto-investment rule' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Rule disabled successfully',
    type: AutoInvestRuleResponseDto,
  })
  async disableAutoInvestRule(
    @Request() req,
    @Param('id') id: string,
  ): Promise<AutoInvestRuleResponseDto> {
    return this.autoInvestRulesService.toggleRule(req.user.id, id, false);
  }

  @Post('auto-invest/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute auto-investment rules manually' })
  @ApiResponse({
    status: 200,
    description: 'Auto-investment executed successfully',
    type: AutoInvestExecutionResponseDto,
  })
  async executeAutoInvest(
    @Request() req,
    @Body() executeDto: ExecuteAutoInvestDto,
  ): Promise<AutoInvestExecutionResponseDto> {
    return this.autoInvestRulesService.executeAutoInvestment(req.user.id, executeDto);
  }
}
