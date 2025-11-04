import {
  Controller,
  Post,
  Get,
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
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreatePaymentDto,
  VerifyPaymentDto,
  GetTransactionsDto,
} from './dto/payment.dto';
import {
  PaymentOrderResponseDto,
  PaymentVerificationResponseDto,
  TransactionResponseDto,
  TransactionListResponseDto,
  PaymentStatsResponseDto,
} from './dto/payment-response.dto';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new payment order' })
  @ApiResponse({
    status: 200,
    description: 'Payment order created successfully',
    type: PaymentOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPaymentOrder(
    @Request() req,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentOrderResponseDto> {
    return this.paymentsService.createPaymentOrder(req.user.id, createPaymentDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify payment and apply auto-save' })
  @ApiResponse({
    status: 200,
    description: 'Payment verified successfully',
    type: PaymentVerificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async verifyPayment(
    @Request() req,
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ): Promise<PaymentVerificationResponseDto> {
    return this.paymentsService.verifyPayment(req.user.id, verifyPaymentDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['PAYMENT', 'DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'REDEMPTION'],
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: TransactionListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactions(
    @Request() req,
    @Query() query: GetTransactionsDto,
  ): Promise<TransactionListResponseDto> {
    return this.paymentsService.getTransactions(req.user.id, query);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get single transaction details' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction details retrieved',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(
    @Request() req,
    @Param('id') id: string,
  ): Promise<TransactionResponseDto> {
    return this.paymentsService.getTransaction(req.user.id, id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved',
    type: PaymentStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentStats(@Request() req): Promise<PaymentStatsResponseDto> {
    return this.paymentsService.getPaymentStats(req.user.id);
  }
}
