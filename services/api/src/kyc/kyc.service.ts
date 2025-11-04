import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KycStatus } from '@prisma/client';
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
import * as crypto from 'crypto';

@Injectable()
export class KycService {
  // Store OTP references temporarily (in production, use Redis)
  private aadhaarOtpStore = new Map<string, { aadhaarNumber: string; otp: string; expiresAt: Date }>();

  constructor(private prisma: PrismaService) {}

  // ============================================
  // PAN VERIFICATION
  // ============================================

  async verifyPan(userId: string, verifyDto: VerifyPanDto): Promise<PanVerificationResponseDto> {
    const { panNumber, panName } = verifyDto;

    // Check if PAN already exists for another user
    const existingKyc = await this.prisma.kycDocument.findFirst({
      where: {
        panNumber,
        userId: { not: userId },
      },
    });

    if (existingKyc) {
      throw new ConflictException('PAN card already registered with another account');
    }

    // TODO: Integrate with actual PAN verification API
    // Options:
    // 1. NSDL PAN Verification API
    // 2. Income Tax Department API
    // 3. Third-party KYC providers (IDfy, Signzy, etc.)

    const panVerificationResult = await this.mockPanVerification(panNumber, panName);

    if (!panVerificationResult.verified) {
      throw new BadRequestException('PAN verification failed. Please check your details.');
    }

    // Update or create KYC document
    const kycDoc = await this.prisma.kycDocument.upsert({
      where: { userId },
      update: {
        panNumber,
        panName,
        panVerified: true,
      },
      create: {
        userId,
        panNumber,
        panName,
        panVerified: true,
      },
    });

    // Update user KYC status and level
    await this.updateUserKycStatus(userId);
    await this.updateUserKycLevel(userId);

    return {
      success: true,
      message: 'PAN verified successfully',
      verified: true,
      panNumber,
      panName,
      dob: panVerificationResult.dob,
    };
  }

  // ============================================
  // AADHAAR VERIFICATION
  // ============================================

  async initiateAadhaarVerification(
    userId: string,
    verifyDto: VerifyAadhaarDto,
  ): Promise<AadhaarVerificationResponseDto> {
    const { aadhaarNumber } = verifyDto;

    // Check if Aadhaar already exists for another user
    const existingKyc = await this.prisma.kycDocument.findFirst({
      where: {
        aadhaarNumber,
        userId: { not: userId },
      },
    });

    if (existingKyc) {
      throw new ConflictException('Aadhaar already registered with another account');
    }

    // TODO: Integrate with DigiLocker or Aadhaar eKYC API
    // Options:
    // 1. DigiLocker API (recommended)
    // 2. UIDAI Aadhaar eSign/eKYC
    // 3. Third-party providers (IDfy, Signzy, etc.)

    const result = await this.mockAadhaarOtpGeneration(aadhaarNumber);

    // Store OTP reference temporarily
    this.aadhaarOtpStore.set(result.referenceId, {
      aadhaarNumber,
      otp: result.otp,
      expiresAt: new Date(Date.now() + 120000), // 2 minutes
    });

    return {
      success: true,
      message: 'OTP sent to Aadhaar-linked mobile number',
      referenceId: result.referenceId,
      expiresIn: 120,
    };
  }

  async verifyAadhaarOtp(
    userId: string,
    verifyDto: VerifyAadhaarOtpDto,
  ): Promise<AadhaarOtpVerificationResponseDto> {
    const { otp, referenceId } = verifyDto;

    // Retrieve OTP data
    const otpData = this.aadhaarOtpStore.get(referenceId);

    if (!otpData) {
      throw new BadRequestException('Invalid or expired OTP reference');
    }

    if (new Date() > otpData.expiresAt) {
      this.aadhaarOtpStore.delete(referenceId);
      throw new BadRequestException('OTP has expired');
    }

    if (otpData.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // OTP verified, fetch Aadhaar data
    // TODO: Call actual Aadhaar API to fetch user data
    const aadhaarData = await this.mockAadhaarDataFetch(otpData.aadhaarNumber);

    // Encrypt Aadhaar number before storing
    const encryptedAadhaar = this.encryptAadhaar(otpData.aadhaarNumber);

    // Update KYC document
    await this.prisma.kycDocument.upsert({
      where: { userId },
      update: {
        aadhaarNumber: encryptedAadhaar,
        aadhaarVerified: true,
      },
      create: {
        userId,
        aadhaarNumber: encryptedAadhaar,
        aadhaarVerified: true,
      },
    });

    // Update user KYC status and level
    await this.updateUserKycStatus(userId);
    await this.updateUserKycLevel(userId);

    // Clean up OTP data
    this.aadhaarOtpStore.delete(referenceId);

    return {
      success: true,
      message: 'Aadhaar verified successfully',
      verified: true,
      aadhaarNumber: this.maskAadhaar(otpData.aadhaarNumber),
      aadhaarData,
    };
  }

  // ============================================
  // BANK ACCOUNT VERIFICATION
  // ============================================

  async verifyBankAccount(
    userId: string,
    verifyDto: VerifyBankAccountDto,
  ): Promise<BankVerificationResponseDto> {
    const { accountNumber, ifscCode, accountHolderName } = verifyDto;

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if PAN is verified (required for bank verification)
    const kycDoc = user.kycDocuments[0];
    if (!kycDoc || !kycDoc.panVerified) {
      throw new BadRequestException('PAN verification required before bank verification');
    }

    // TODO: Integrate with penny drop/bank verification API
    // Options:
    // 1. Razorpay Fund Account Validation
    // 2. Cashfree Penny Drop API
    // 3. Third-party providers (IDfy, Signzy, etc.)

    const bankVerificationResult = await this.mockBankVerification(
      accountNumber,
      ifscCode,
      accountHolderName,
    );

    if (!bankVerificationResult.verified) {
      throw new BadRequestException('Bank account verification failed. Please check your details.');
    }

    // Encrypt bank account number
    const encryptedAccountNumber = this.encryptBankAccount(accountNumber);

    // Update KYC document
    await this.prisma.kycDocument.update({
      where: { userId },
      data: {
        bankAccountNumber: encryptedAccountNumber,
        bankIfsc: ifscCode,
        bankAccountName: accountHolderName,
        bankVerified: true,
      },
    });

    // Update user KYC status
    await this.updateUserKycStatus(userId);

    return {
      success: true,
      message: 'Bank account verified successfully',
      verified: true,
      accountNumber: this.maskBankAccount(accountNumber),
      ifscCode,
      accountHolderName,
      bankName: bankVerificationResult.bankName,
      branchName: bankVerificationResult.branchName,
    };
  }

  // ============================================
  // LIVENESS DETECTION
  // ============================================

  async verifyLiveness(
    userId: string,
    verifyDto: VerifyLivenessDto,
  ): Promise<LivenessVerificationResponseDto> {
    const { selfieUrl, videoUrl } = verifyDto;

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if Aadhaar is verified (recommended for face matching)
    const kycDoc = user.kycDocuments[0];
    if (!kycDoc || !kycDoc.aadhaarVerified) {
      throw new BadRequestException(
        'Aadhaar verification required before liveness detection',
      );
    }

    // TODO: Integrate with actual liveness detection API
    // Options:
    // 1. AWS Rekognition (DetectFaces + CompareFaces)
    // 2. Azure Face API (Face Detection + Liveness Detection)
    // 3. Google Cloud Vision API
    // 4. FaceIO / Face++ / Kairos
    // 5. Third-party KYC providers (IDfy, Signzy, etc.)

    const livenessResult = await this.mockLivenessDetection(selfieUrl, videoUrl);

    if (livenessResult.livenessScore < 70) {
      throw new BadRequestException(
        'Liveness detection failed. Please ensure good lighting and follow instructions.',
      );
    }

    // Perform face matching with Aadhaar photo (if available)
    // TODO: In production, fetch Aadhaar photo from DigiLocker and compare
    const faceMatchResult = await this.mockFaceMatching(selfieUrl);

    if (!faceMatchResult.matched) {
      throw new BadRequestException(
        'Face does not match with Aadhaar photo. Please try again.',
      );
    }

    // Update KYC document with liveness verification
    await this.prisma.kycDocument.update({
      where: { userId },
      data: {
        selfieUrl,
        livenessScore: livenessResult.livenessScore,
        livenessVerified: true,
        faceMatched: faceMatchResult.matched,
      },
    });

    // Update user KYC status and level
    await this.updateUserKycStatus(userId);
    await this.updateUserKycLevel(userId);

    return {
      success: true,
      message: 'Liveness verified successfully',
      verified: true,
      livenessScore: livenessResult.livenessScore,
      faceMatched: faceMatchResult.matched,
      selfieUrl,
      livenessDetails: livenessResult.details,
    };
  }

  // ============================================
  // DOCUMENT UPLOAD
  // ============================================

  async uploadDocument(
    userId: string,
    uploadDto: UploadDocumentDto,
  ): Promise<DocumentUploadResponseDto> {
    const { documentType, documentUrl } = uploadDto;

    // TODO: Implement actual document upload to S3/Cloud Storage
    // TODO: Implement document quality check
    // TODO: Implement face matching for selfie

    const qualityScore = await this.mockDocumentQualityCheck(documentUrl);

    if (qualityScore < 70) {
      throw new BadRequestException('Document quality is too low. Please upload a clearer image.');
    }

    // Update KYC document based on type
    const updateData: any = {};

    if (documentType === 'SELFIE') {
      updateData.selfieUrl = documentUrl;
      // TODO: Implement face matching with PAN/Aadhaar photo
      updateData.faceMatched = true; // Mock for now
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.kycDocument.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          ...updateData,
        },
      });

      // Update user KYC status
      await this.updateUserKycStatus(userId);
    }

    return {
      success: true,
      message: 'Document uploaded successfully',
      documentType,
      documentUrl,
      qualityScore,
    };
  }

  // ============================================
  // KYC STATUS MANAGEMENT
  // ============================================

  async getKycStatus(userId: string): Promise<KycStatusResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const kycDoc = user.kycDocuments[0];

    const verificationStatus = {
      panVerified: kycDoc?.panVerified || false,
      aadhaarVerified: kycDoc?.aadhaarVerified || false,
      bankVerified: kycDoc?.bankVerified || false,
      selfieVerified: kycDoc?.faceMatched || false,
    };

    const completionPercentage = this.calculateKycCompletion(verificationStatus);
    const nextSteps = this.getNextSteps(verificationStatus);

    return {
      userId,
      kycStatus: user.kycStatus,
      completionPercentage,
      verificationStatus,
      nextSteps,
      kycDocument: kycDoc ? this.toKycDocumentResponse(kycDoc) : undefined,
    };
  }

  async getAllKyc(query: GetKycQueryDto): Promise<KycListResponseDto> {
    const { status, page = 1, limit = 10 } = query;

    const where: any = {};
    if (status) where.kycStatus = status;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { kycDocuments: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = await Promise.all(
      users.map(user => this.getKycStatus(user.id))
    );

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

  async updateKycStatus(
    userId: string,
    updateDto: UpdateKycStatusDto,
  ): Promise<{ success: boolean; message: string }> {
    const { status, rejectionReason } = updateDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: status as KycStatus },
    });

    if (status === 'REJECTED' && rejectionReason) {
      await this.prisma.kycDocument.update({
        where: { userId },
        data: { rejectionReason },
      });
    }

    return {
      success: true,
      message: `KYC status updated to ${status}`,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async updateUserKycStatus(userId: string): Promise<void> {
    const kycDoc = await this.prisma.kycDocument.findUnique({
      where: { userId },
    });

    if (!kycDoc) return;

    let newStatus: KycStatus = KycStatus.PENDING;

    if (kycDoc.panVerified && !kycDoc.aadhaarVerified) {
      newStatus = KycStatus.IN_PROGRESS;
    } else if (kycDoc.panVerified && kycDoc.aadhaarVerified && !kycDoc.livenessVerified) {
      newStatus = KycStatus.IN_PROGRESS;
    } else if (kycDoc.panVerified && kycDoc.aadhaarVerified && kycDoc.livenessVerified && kycDoc.faceMatched) {
      newStatus = KycStatus.APPROVED;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: newStatus },
    });
  }

  private async updateUserKycLevel(userId: string): Promise<void> {
    const kycDoc = await this.prisma.kycDocument.findUnique({
      where: { userId },
    });

    if (!kycDoc) return;

    let newLevel = 0;

    // Level 1: PAN verified (allows payments up to ₹50,000)
    if (kycDoc.panVerified) {
      newLevel = 1;
    }

    // Level 2: Full KYC (PAN + Aadhaar + Liveness verified, allows investments)
    if (kycDoc.panVerified && kycDoc.aadhaarVerified && kycDoc.livenessVerified && kycDoc.faceMatched) {
      newLevel = 2;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { kycLevel: newLevel },
    });
  }

  private calculateKycCompletion(verificationStatus: any): number {
    const steps = Object.values(verificationStatus);
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  }

  private getNextSteps(verificationStatus: any): string[] {
    const steps: string[] = [];

    if (!verificationStatus.panVerified) steps.push('Verify PAN card');
    if (!verificationStatus.aadhaarVerified) steps.push('Verify Aadhaar');
    if (!verificationStatus.bankVerified) steps.push('Verify bank account');
    if (!verificationStatus.selfieVerified) steps.push('Upload selfie for verification');

    if (steps.length === 0) steps.push('KYC verification complete');

    return steps;
  }

  private encryptAadhaar(aadhaarNumber: string): string {
    // TODO: Use proper encryption (AES-256)
    // For now, just store masked version
    return aadhaarNumber;
  }

  private encryptBankAccount(accountNumber: string): string {
    // TODO: Use proper encryption (AES-256)
    return accountNumber;
  }

  private maskAadhaar(aadhaarNumber: string): string {
    return 'XXXX-XXXX-' + aadhaarNumber.slice(-4);
  }

  private maskBankAccount(accountNumber: string): string {
    return 'XXXX' + accountNumber.slice(-4);
  }

  private toKycDocumentResponse(kycDoc: any): any {
    return {
      id: kycDoc.id,
      userId: kycDoc.userId,
      panNumber: kycDoc.panNumber,
      panName: kycDoc.panName,
      panVerified: kycDoc.panVerified,
      aadhaarNumber: kycDoc.aadhaarNumber ? this.maskAadhaar(kycDoc.aadhaarNumber) : undefined,
      aadhaarVerified: kycDoc.aadhaarVerified,
      bankAccountNumber: kycDoc.bankAccountNumber ? this.maskBankAccount(kycDoc.bankAccountNumber) : undefined,
      bankIfsc: kycDoc.bankIfsc,
      bankAccountName: kycDoc.bankAccountName,
      bankVerified: kycDoc.bankVerified,
      selfieUrl: kycDoc.selfieUrl,
      faceMatched: kycDoc.faceMatched,
      rejectionReason: kycDoc.rejectionReason,
      createdAt: kycDoc.createdAt,
      updatedAt: kycDoc.updatedAt,
    };
  }

  // ============================================
  // MOCK IMPLEMENTATIONS (Replace with real APIs)
  // ============================================

  private async mockPanVerification(panNumber: string, panName: string): Promise<any> {
    // TODO: Replace with actual PAN verification API call
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock: Verify PAN format and return success
    return {
      verified: true,
      panNumber,
      panName,
      dob: '01/01/1990', // Mock DOB
    };
  }

  private async mockAadhaarOtpGeneration(aadhaarNumber: string): Promise<any> {
    // TODO: Replace with actual Aadhaar OTP API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const referenceId = crypto.randomBytes(16).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In development, log OTP
    console.log(`[DEV] Aadhaar OTP for ${aadhaarNumber}: ${otp}`);

    return {
      referenceId,
      otp,
    };
  }

  private async mockAadhaarDataFetch(aadhaarNumber: string): Promise<any> {
    // TODO: Replace with actual Aadhaar data fetch
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      name: 'Rahul Kumar',
      dob: '01/01/1990',
      gender: 'M',
      address: 'Mumbai, Maharashtra, India',
    };
  }

  private async mockBankVerification(
    accountNumber: string,
    ifscCode: string,
    accountHolderName: string,
  ): Promise<any> {
    // TODO: Replace with actual penny drop API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Extract bank code from IFSC (first 4 characters)
    const bankCode = ifscCode.substring(0, 4);
    const bankNames = {
      'SBIN': 'State Bank of India',
      'HDFC': 'HDFC Bank',
      'ICIC': 'ICICI Bank',
      'AXIS': 'Axis Bank',
      'YESB': 'Yes Bank',
    };

    return {
      verified: true,
      accountNumber,
      ifscCode,
      accountHolderName,
      bankName: bankNames[bankCode] || 'Unknown Bank',
      branchName: 'Main Branch',
    };
  }

  private async mockDocumentQualityCheck(documentUrl: string): Promise<number> {
    // TODO: Replace with actual image quality/OCR check
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock: Return random quality score between 75-95
    return Math.floor(75 + Math.random() * 20);
  }

  private async mockLivenessDetection(
    selfieUrl: string,
    videoUrl?: string,
  ): Promise<{
    livenessScore: number;
    details: {
      blinkDetected: boolean;
      smileDetected: boolean;
      headTurnDetected: boolean;
      qualityScore: number;
    };
  }> {
    // TODO: Replace with actual liveness detection API
    // Options:
    // 1. AWS Rekognition: DetectFaces with quality/pose analysis
    // 2. Azure Face API: Liveness Detection
    // 3. FaceIO / Face++ APIs

    console.log('[MOCK] Liveness Detection:', { selfieUrl, videoUrl });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock liveness checks (in production, analyze video frames or selfie quality)
    const details = {
      blinkDetected: Math.random() > 0.1, // 90% success rate
      smileDetected: Math.random() > 0.2, // 80% success rate
      headTurnDetected: videoUrl ? Math.random() > 0.15 : false, // 85% if video provided
      qualityScore: 80 + Math.random() * 15, // 80-95
    };

    // Calculate overall liveness score
    let livenessScore = details.qualityScore;
    if (details.blinkDetected) livenessScore += 2;
    if (details.smileDetected) livenessScore += 1;
    if (details.headTurnDetected) livenessScore += 2;

    // Cap at 100
    livenessScore = Math.min(livenessScore, 100);

    return {
      livenessScore: parseFloat(livenessScore.toFixed(2)),
      details: {
        ...details,
        qualityScore: parseFloat(details.qualityScore.toFixed(2)),
      },
    };
  }

  private async mockFaceMatching(selfieUrl: string): Promise<{ matched: boolean; similarity: number }> {
    // TODO: Replace with actual face comparison API
    // Options:
    // 1. AWS Rekognition: CompareFaces
    // 2. Azure Face API: Face Verification
    // 3. FaceIO / Face++ APIs

    console.log('[MOCK] Face Matching with Aadhaar photo:', selfieUrl);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock: 95% match success rate
    const similarity = 75 + Math.random() * 20; // 75-95% similarity
    const matched = similarity > 70; // Threshold of 70%

    return {
      matched,
      similarity: parseFloat(similarity.toFixed(2)),
    };
  }
}
