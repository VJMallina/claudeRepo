import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PdfService } from './pdf.service';
import { AccountStatementService } from './account-statement.service';
import { InvestmentReceiptService } from './investment-receipt.service';
import { ScheduledStatementsService } from './scheduled-statements.service';
import { PdfController } from './pdf.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PdfController],
  providers: [
    PdfService,
    AccountStatementService,
    InvestmentReceiptService,
    ScheduledStatementsService,
  ],
  exports: [
    PdfService,
    AccountStatementService,
    InvestmentReceiptService,
  ],
})
export class PdfModule {}
