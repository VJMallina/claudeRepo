import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AccountStatementService } from './account-statement.service';
import { InvestmentReceiptService } from './investment-receipt.service';
import { ScheduledStatementsService } from './scheduled-statements.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('statements')
@Controller('statements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PdfController {
  constructor(
    private accountStatementService: AccountStatementService,
    private investmentReceiptService: InvestmentReceiptService,
    private scheduledStatementsService: ScheduledStatementsService,
  ) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily account statement PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  async getDailyStatement(
    @GetUser('id') userId: string,
    @Query('date') date: string,
    @Res() res: Response,
  ) {
    try {
      const statementDate = date ? new Date(date) : new Date();
      const pdfBuffer = await this.accountStatementService.generateDailyStatement(
        userId,
        statementDate,
      );

      const filename = `Daily_Statement_${statementDate.toISOString().split('T')[0]}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate statement',
        error: error.message,
      });
    }
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly account statement PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  async getMonthlyStatement(
    @GetUser('id') userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    try {
      const yearNum = year ? parseInt(year) : new Date().getFullYear();
      const monthNum = month ? parseInt(month) : new Date().getMonth() + 1;

      const pdfBuffer = await this.accountStatementService.generateMonthlyStatement(
        userId,
        yearNum,
        monthNum,
      );

      const filename = `Monthly_Statement_${yearNum}-${monthNum.toString().padStart(2, '0')}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate statement',
        error: error.message,
      });
    }
  }

  @Get('investment-receipt/:investmentId')
  @ApiOperation({ summary: 'Get investment receipt PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  async getInvestmentReceipt(
    @Param('investmentId') investmentId: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.investmentReceiptService.regenerateReceipt(
        investmentId,
      );

      const filename = `Investment_Receipt_${investmentId}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate receipt',
        error: error.message,
      });
    }
  }

  @Post('send-daily')
  @ApiOperation({ summary: 'Manually trigger daily statement email (for testing)' })
  @ApiResponse({ status: 200, description: 'Statement sent successfully' })
  async sendDailyStatement(@GetUser('id') userId: string) {
    try {
      await this.scheduledStatementsService.triggerDailyStatementForUser(userId);
      return {
        message: 'Daily statement sent successfully',
      };
    } catch (error) {
      return {
        message: 'Failed to send statement',
        error: error.message,
      };
    }
  }

  @Get('has-activity')
  @ApiOperation({ summary: 'Check if user has activity today' })
  @ApiResponse({ status: 200, description: 'Activity status returned' })
  async hasActivity(
    @GetUser('id') userId: string,
    @Query('date') date: string,
  ) {
    const checkDate = date ? new Date(date) : new Date();
    const hasActivity = await this.accountStatementService.hasActivityToday(
      userId,
      checkDate,
    );

    return {
      hasActivity,
      date: checkDate.toISOString(),
    };
  }
}
