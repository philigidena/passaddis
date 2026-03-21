import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyTier, LoyaltyTransactionType } from '@prisma/client';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateAccount(userId: string) {
    let account = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      account = await this.prisma.loyaltyAccount.create({
        data: { userId, points: 0, lifetimePoints: 0, tier: 'BRONZE' },
      });
    }

    return account;
  }

  async getAccount(userId: string) {
    const account = await this.getOrCreateAccount(userId);

    const recentTransactions = await this.prisma.loyaltyTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return { ...account, recentTransactions };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const account = await this.getOrCreateAccount(userId);

    const [transactions, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.loyaltyTransaction.count({
        where: { accountId: account.id },
      }),
    ]);

    return {
      transactions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async earnPoints(
    userId: string,
    points: number,
    type: LoyaltyTransactionType,
    description: string,
    reference?: string,
  ) {
    const account = await this.getOrCreateAccount(userId);

    const newLifetime = account.lifetimePoints + points;
    const newTier = this.calculateTier(newLifetime);

    const [updatedAccount] = await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          points: { increment: points },
          lifetimePoints: { increment: points },
          tier: newTier,
        },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type,
          points,
          description,
          reference,
        },
      }),
    ]);

    return updatedAccount;
  }

  async redeemPoints(
    userId: string,
    points: number,
    description: string,
    reference?: string,
  ) {
    const account = await this.getOrCreateAccount(userId);

    if (account.points < points) {
      throw new BadRequestException(
        `Insufficient points. Balance: ${account.points}, requested: ${points}`,
      );
    }

    const [updatedAccount] = await this.prisma.$transaction([
      this.prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { points: { decrement: points } },
      }),
      this.prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: 'REDEMPTION' as LoyaltyTransactionType,
          points: -points,
          description,
          reference,
        },
      }),
    ]);

    return updatedAccount;
  }

  calculateTier(lifetimePoints: number): LoyaltyTier {
    if (lifetimePoints >= 5000) return 'PLATINUM';
    if (lifetimePoints >= 2000) return 'GOLD';
    if (lifetimePoints >= 500) return 'SILVER';
    return 'BRONZE';
  }
}
