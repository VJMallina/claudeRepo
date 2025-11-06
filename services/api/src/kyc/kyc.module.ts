import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { PrismaModule } from '../prisma/prisma.module';
import {
  PanVerificationService,
  AadhaarVerificationService,
  FaceDetectionService,
  BankVerificationService,
} from './integrations';

@Module({
  imports: [PrismaModule],
  controllers: [KycController],
  providers: [
    KycService,
    PanVerificationService,
    AadhaarVerificationService,
    FaceDetectionService,
    BankVerificationService,
  ],
  exports: [KycService],
})
export class KycModule {}
