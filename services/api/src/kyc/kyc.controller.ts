import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
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
import { KycService } from './kyc.service';
import {
  VerifyPanDto,
  VerifyAadhaarDto,
  VerifyAadhaarOtpDto,
  VerifyBankAccountDto,
  VerifyLivenessDto,
  UploadDocumentDto,
  UpdateKycStatusDto,
  GetKycQueryDto,
} from './dto/kyc.dto';
import {
  KycStatusResponseDto,
  PanVerificationResponseDto,
  AadhaarVerificationResponseDto,
  AadhaarOtpVerificationResponseDto,
  BankVerificationResponseDto,
  LivenessVerificationResponseDto,
  DocumentUploadResponseDto,
  KycListResponseDto,
} from './dto/kyc-response.dto';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  // ============================================
  // KYC STATUS
  // ============================================

  @Get('status')
  @ApiOperation({
    summary: 'Get KYC status and completion percentage',
    description: 'Get current KYC verification status with next steps',
  })
  @ApiResponse({
    status: 200,
    description: 'KYC status retrieved successfully',
    type: KycStatusResponseDto,
  })
  async getKycStatus(@Request() req): Promise<KycStatusResponseDto> {
    return this.kycService.getKycStatus(req.user.userId);
  }

  // ============================================
  // PAN VERIFICATION
  // ============================================

  @Post('verify-pan')
  @ApiOperation({
    summary: 'Verify PAN card',
    description: 'Verify PAN card number with name. Required for Level 1 KYC.',
  })
  @ApiResponse({
    status: 200,
    description: 'PAN verified successfully',
    type: PanVerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid PAN or verification failed',
  })
  @ApiResponse({
    status: 409,
    description: 'PAN already registered with another account',
  })
  async verifyPan(
    @Request() req,
    @Body() verifyDto: VerifyPanDto,
  ): Promise<PanVerificationResponseDto> {
    return this.kycService.verifyPan(req.user.userId, verifyDto);
  }

  // ============================================
  // AADHAAR VERIFICATION
  // ============================================

  @Post('verify-aadhaar/initiate')
  @ApiOperation({
    summary: 'Initiate Aadhaar verification',
    description: 'Send OTP to Aadhaar-linked mobile number for verification',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: AadhaarVerificationResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Aadhaar already registered with another account',
  })
  async initiateAadhaarVerification(
    @Request() req,
    @Body() verifyDto: VerifyAadhaarDto,
  ): Promise<AadhaarVerificationResponseDto> {
    return this.kycService.initiateAadhaarVerification(req.user.userId, verifyDto);
  }

  @Post('verify-aadhaar/complete')
  @ApiOperation({
    summary: 'Complete Aadhaar verification with OTP',
    description: 'Verify OTP and fetch Aadhaar details',
  })
  @ApiResponse({
    status: 200,
    description: 'Aadhaar verified successfully',
    type: AadhaarOtpVerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  async verifyAadhaarOtp(
    @Request() req,
    @Body() verifyDto: VerifyAadhaarOtpDto,
  ): Promise<AadhaarOtpVerificationResponseDto> {
    return this.kycService.verifyAadhaarOtp(req.user.userId, verifyDto);
  }

  // ============================================
  // BANK ACCOUNT VERIFICATION
  // ============================================

  @Post('verify-bank')
  @ApiOperation({
    summary: 'Verify bank account',
    description: 'Verify bank account using penny drop method. PAN verification required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank account verified successfully',
    type: BankVerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid bank details or PAN not verified',
  })
  async verifyBankAccount(
    @Request() req,
    @Body() verifyDto: VerifyBankAccountDto,
  ): Promise<BankVerificationResponseDto> {
    return this.kycService.verifyBankAccount(req.user.userId, verifyDto);
  }

  // ============================================
  // LIVENESS DETECTION
  // ============================================

  @Post('verify-liveness')
  @ApiOperation({
    summary: 'Verify liveness with selfie/video',
    description: 'Perform liveness detection and face matching for Level 2 KYC. Aadhaar verification required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liveness verified successfully',
    type: LivenessVerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Liveness detection failed or Aadhaar not verified',
  })
  async verifyLiveness(
    @Request() req,
    @Body() verifyDto: VerifyLivenessDto,
  ): Promise<LivenessVerificationResponseDto> {
    return this.kycService.verifyLiveness(req.user.userId, verifyDto);
  }

  // ============================================
  // DOCUMENT UPLOAD
  // ============================================

  @Post('upload-document')
  @ApiOperation({
    summary: 'Upload KYC document',
    description: 'Upload documents like PAN, Aadhaar, selfie, or bank statement',
  })
  @ApiResponse({
    status: 200,
    description: 'Document uploaded successfully',
    type: DocumentUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Document quality too low',
  })
  async uploadDocument(
    @Request() req,
    @Body() uploadDto: UploadDocumentDto,
  ): Promise<DocumentUploadResponseDto> {
    return this.kycService.uploadDocument(req.user.userId, uploadDto);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Get('all')
  @ApiOperation({
    summary: 'Get all KYC records (Admin)',
    description: 'Get paginated list of all KYC records with filters',
  })
  @ApiResponse({
    status: 200,
    description: 'KYC records retrieved successfully',
    type: KycListResponseDto,
  })
  async getAllKyc(@Query() query: GetKycQueryDto): Promise<KycListResponseDto> {
    return this.kycService.getAllKyc(query);
  }

  @Put(':userId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update KYC status (Admin)',
    description: 'Manually update KYC status for a user (approve/reject)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'KYC status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateKycStatus(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateKycStatusDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.kycService.updateKycStatus(userId, updateDto);
  }
}
