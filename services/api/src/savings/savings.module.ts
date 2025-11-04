import { Module } from '@nestjs/common';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';
import { AutoInvestRulesService } from './auto-invest-rules.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavingsController],
  providers: [SavingsService, AutoInvestRulesService],
  exports: [SavingsService, AutoInvestRulesService],
})
export class SavingsModule {}
