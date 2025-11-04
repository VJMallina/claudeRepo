import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BankAccountsService } from './bank-accounts.service';
import { AddBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
import {
  BankAccountResponseDto,
  VerifyBankAccountResponseDto,
} from './dto/bank-account-response.dto';

@ApiTags('Bank Accounts')
@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a new bank account',
    description: 'Add a bank account for withdrawals. First account is automatically set as primary.',
  })
  @ApiResponse({
    status: 201,
    description: 'Bank account added successfully',
    type: BankAccountResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Bank account already exists' })
  async addBankAccount(
    @Request() req,
    @Body() addDto: AddBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    return this.bankAccountsService.addBankAccount(req.user.userId, addDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bank accounts',
    description: 'Get all linked bank accounts for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank accounts retrieved successfully',
    type: [BankAccountResponseDto],
  })
  async getUserBankAccounts(@Request() req): Promise<BankAccountResponseDto[]> {
    return this.bankAccountsService.getUserBankAccounts(req.user.userId);
  }

  @Get('primary')
  @ApiOperation({
    summary: 'Get primary bank account',
    description: 'Get the primary bank account for withdrawals',
  })
  @ApiResponse({
    status: 200,
    description: 'Primary account retrieved',
    type: BankAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No primary account found' })
  async getPrimaryBankAccount(@Request() req): Promise<BankAccountResponseDto | null> {
    return this.bankAccountsService.getPrimaryBankAccount(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get bank account by ID',
    description: 'Get details of a specific bank account',
  })
  @ApiParam({ name: 'id', description: 'Bank account ID' })
  @ApiResponse({
    status: 200,
    description: 'Bank account retrieved',
    type: BankAccountResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async getBankAccountById(
    @Request() req,
    @Param('id') accountId: string,
  ): Promise<BankAccountResponseDto> {
    return this.bankAccountsService.getBankAccountById(req.user.userId, accountId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update bank account',
    description: 'Update bank account details (only unverified accounts)',
  })
  @ApiParam({ name: 'id', description: 'Bank account ID' })
  @ApiResponse({
    status: 200,
    description: 'Bank account updated',
    type: BankAccountResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot update verified account' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async updateBankAccount(
    @Request() req,
    @Param('id') accountId: string,
    @Body() updateDto: UpdateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    return this.bankAccountsService.updateBankAccount(
      req.user.userId,
      accountId,
      updateDto,
    );
  }

  @Put(':id/primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set as primary account',
    description: 'Set this bank account as the primary account for withdrawals',
  })
  @ApiParam({ name: 'id', description: 'Bank account ID' })
  @ApiResponse({
    status: 200,
    description: 'Primary account updated',
  })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async setPrimaryAccount(
    @Request() req,
    @Param('id') accountId: string,
  ): Promise<{ message: string }> {
    await this.bankAccountsService.setPrimaryAccount(req.user.userId, accountId);
    return { message: 'Primary account updated successfully' };
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify bank account',
    description: 'Verify bank account using penny drop verification',
  })
  @ApiParam({ name: 'id', description: 'Bank account ID' })
  @ApiResponse({
    status: 200,
    description: 'Bank account verified',
    type: VerifyBankAccountResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Verification failed' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async verifyBankAccount(
    @Request() req,
    @Param('id') accountId: string,
  ): Promise<VerifyBankAccountResponseDto> {
    return this.bankAccountsService.verifyBankAccount(req.user.userId, accountId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove bank account',
    description: 'Delete a bank account',
  })
  @ApiParam({ name: 'id', description: 'Bank account ID' })
  @ApiResponse({ status: 204, description: 'Bank account deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete primary account' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async removeBankAccount(
    @Request() req,
    @Param('id') accountId: string,
  ): Promise<void> {
    await this.bankAccountsService.removeBankAccount(req.user.userId, accountId);
  }
}
