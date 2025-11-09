import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
import {
  BankAccountResponseDto,
  VerifyBankAccountResponseDto,
} from './dto/bank-account-response.dto';
import * as crypto from 'crypto';

@Injectable()
export class BankAccountsService {
  // TODO: Move to environment variables
  private readonly encryptionKey = process.env.BANK_ACCOUNT_ENCRYPTION_KEY ||
    'your-32-character-secret-key!!';
  private readonly algorithm = 'aes-256-cbc';

  constructor(private prisma: PrismaService) {}

  // ============================================
  // BANK ACCOUNT MANAGEMENT
  // ============================================

  async addBankAccount(
    userId: string,
    addDto: AddBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if account already exists for this user
    const existingAccounts = await this.getUserBankAccounts(userId);
    const encryptedAccountNumber = this.encryptAccountNumber(addDto.accountNumber);

    const duplicate = existingAccounts.find(
      (acc) => acc.ifscCode === addDto.ifscCode,
    );

    if (duplicate) {
      // Decrypt to compare (in production, use a hash comparison)
      const decrypted = this.decryptAccountNumber(
        (await this.prisma.bankAccount.findUnique({ where: { id: duplicate.id } }))!
          .accountNumber,
      );
      if (decrypted === addDto.accountNumber) {
        throw new ConflictException('Bank account already exists');
      }
    }

    // If this is the first bank account, make it primary
    const isPrimary = existingAccounts.length === 0;

    // Create bank account
    const bankAccount = await this.prisma.bankAccount.create({
      data: {
        userId,
        accountNumber: encryptedAccountNumber,
        ifscCode: addDto.ifscCode.toUpperCase(),
        accountHolderName: addDto.accountHolderName,
        accountType: addDto.accountType || 'SAVINGS',
        bankName: addDto.bankName,
        branchName: addDto.branchName,
        isPrimary,
      },
    });

    return this.mapToResponse(bankAccount);
  }

  async getUserBankAccounts(userId: string): Promise<BankAccountResponseDto[]> {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });

    return accounts.map((acc) => this.mapToResponse(acc));
  }

  async getBankAccountById(
    userId: string,
    accountId: string,
  ): Promise<BankAccountResponseDto> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return this.mapToResponse(account);
  }

  async getPrimaryBankAccount(userId: string): Promise<BankAccountResponseDto | null> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { userId, isPrimary: true },
    });

    if (!account) {
      return null;
    }

    return this.mapToResponse(account);
  }

  async updateBankAccount(
    userId: string,
    accountId: string,
    updateDto: UpdateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    if (account.isVerified) {
      throw new BadRequestException(
        'Cannot update verified bank account. Please add a new account.',
      );
    }

    const updated = await this.prisma.bankAccount.update({
      where: { id: accountId },
      data: updateDto,
    });

    return this.mapToResponse(updated);
  }

  async setPrimaryAccount(userId: string, accountId: string): Promise<void> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (prisma) => {
      // Remove primary flag from all accounts
      await prisma.bankAccount.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });

      // Set new primary
      await prisma.bankAccount.update({
        where: { id: accountId },
        data: { isPrimary: true },
      });
    });
  }

  async removeBankAccount(userId: string, accountId: string): Promise<void> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    if (account.isPrimary) {
      const otherAccounts = await this.prisma.bankAccount.count({
        where: { userId, id: { not: accountId } },
      });

      if (otherAccounts > 0) {
        throw new BadRequestException(
          'Cannot delete primary account. Please set another account as primary first.',
        );
      }
    }

    await this.prisma.bankAccount.delete({
      where: { id: accountId },
    });
  }

  // ============================================
  // BANK ACCOUNT VERIFICATION
  // ============================================

  async verifyBankAccount(
    userId: string,
    accountId: string,
  ): Promise<VerifyBankAccountResponseDto> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    if (account.isVerified) {
      return {
        success: true,
        message: 'Bank account already verified',
        verificationMethod: account.verificationMethod || undefined,
      };
    }

    // Decrypt account number for verification
    const accountNumber = this.decryptAccountNumber(account.accountNumber);

    // TODO: Integrate with Razorpay/Cashfree Penny Drop API
    const verificationResult = await this.performPennyDropVerification(
      accountNumber,
      account.ifscCode,
      account.accountHolderName,
    );

    if (!verificationResult.success) {
      throw new BadRequestException(
        verificationResult.message || 'Bank verification failed',
      );
    }

    // Update account as verified
    await this.prisma.bankAccount.update({
      where: { id: accountId },
      data: {
        isVerified: true,
        verificationMethod: 'PENNY_DROP',
        verifiedAt: new Date(),
        bankName: verificationResult.bankName || account.bankName,
      },
    });

    return {
      success: true,
      message: 'Bank account verified successfully',
      verificationMethod: 'PENNY_DROP',
      accountHolderName: verificationResult.accountHolderName,
      bankName: verificationResult.bankName,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private encryptAccountNumber(accountNumber: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(accountNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptAccountNumber(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private maskAccountNumber(accountNumber: string): string {
    // Show only last 4 digits
    if (accountNumber.length <= 4) {
      return '****';
    }
    return '****' + accountNumber.slice(-4);
  }

  private mapToResponse(bankAccount: any): BankAccountResponseDto {
    const decrypted = this.decryptAccountNumber(bankAccount.accountNumber);
    const masked = this.maskAccountNumber(decrypted);

    return {
      id: bankAccount.id,
      userId: bankAccount.userId,
      accountNumber: masked,
      ifscCode: bankAccount.ifscCode,
      accountHolderName: bankAccount.accountHolderName,
      bankName: bankAccount.bankName,
      branchName: bankAccount.branchName,
      accountType: bankAccount.accountType,
      isPrimary: bankAccount.isPrimary,
      verified: bankAccount.isVerified,
      verificationMethod: bankAccount.verificationMethod,
      verifiedAt: bankAccount.verifiedAt,
      createdAt: bankAccount.createdAt,
      updatedAt: bankAccount.updatedAt,
    };
  }

  private async performPennyDropVerification(
    accountNumber: string,
    ifscCode: string,
    accountHolderName: string,
  ): Promise<{
    success: boolean;
    message?: string;
    accountHolderName?: string;
    bankName?: string;
  }> {
    // TODO: Replace with actual Razorpay/Cashfree penny drop API
    // Mock verification for now
    console.log('[MOCK] Penny Drop Verification:', {
      accountNumber: this.maskAccountNumber(accountNumber),
      ifscCode,
      accountHolderName,
    });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success response (95% success rate)
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      return {
        success: false,
        message: 'Bank account verification failed. Please check account details.',
      };
    }

    // Mock bank name lookup from IFSC
    const bankPrefixes: Record<string, string> = {
      SBIN: 'State Bank of India',
      HDFC: 'HDFC Bank',
      ICIC: 'ICICI Bank',
      AXIS: 'Axis Bank',
      PUNB: 'Punjab National Bank',
      KKBK: 'Kotak Mahindra Bank',
    };

    const bankPrefix = ifscCode.substring(0, 4);
    const bankName = bankPrefixes[bankPrefix] || 'Unknown Bank';

    return {
      success: true,
      accountHolderName,
      bankName,
    };
  }

  // ============================================
  // ADMIN/UTILITY METHODS
  // ============================================

  async getDecryptedAccountNumber(
    userId: string,
    accountId: string,
  ): Promise<string> {
    // This should only be called internally or by admin with proper authorization
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return this.decryptAccountNumber(account.accountNumber);
  }
}
