import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        savingsConfig: true,
        savingsWallet: true,
        kycDocuments: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { pin, ...userWithoutPin } = user;
    return userWithoutPin;
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        mobile: true,
        email: true,
        name: true,
        dob: true,
        profilePhoto: true,
        kycStatus: true,
        updatedAt: true,
      },
    });
  }

  async enableBiometric(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { biometricEnabled: true },
    });
  }

  async disableBiometric(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { biometricEnabled: false },
    });
  }
}
