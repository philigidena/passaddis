import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create or get a referral link for a user
   */
  async getOrCreateReferral(userId: string, eventId?: string) {
    const existing = await this.prisma.referral.findFirst({
      where: { referrerId: userId, eventId: eventId || null },
    });

    if (existing) return existing;

    // Generate a unique code
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    });

    const baseName = (user?.name || user?.phone || 'REF')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 8)
      .toUpperCase();
    const code = `${baseName}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return this.prisma.referral.create({
      data: {
        code,
        referrerId: userId,
        eventId,
        commissionRate: 5,
      },
    });
  }

  /**
   * Track a click on a referral link
   */
  async trackClick(code: string) {
    const referral = await this.prisma.referral.findUnique({ where: { code } });
    if (!referral || !referral.isActive) return null;

    await this.prisma.referral.update({
      where: { id: referral.id },
      data: { clicks: { increment: 1 } },
    });

    return { eventId: referral.eventId, referrerId: referral.referrerId };
  }

  /**
   * Record a conversion (ticket purchase via referral)
   */
  async recordConversion(code: string, orderAmount: number) {
    const referral = await this.prisma.referral.findUnique({ where: { code } });
    if (!referral || !referral.isActive) return;

    const commission = orderAmount * (referral.commissionRate / 100);

    await this.prisma.referral.update({
      where: { id: referral.id },
      data: {
        conversions: { increment: 1 },
        totalEarnings: { increment: commission },
      },
    });
  }

  /**
   * Get referral stats for a user
   */
  async getUserReferrals(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: { event: { select: { id: true, title: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totals = referrals.reduce(
      (acc, r) => ({
        clicks: acc.clicks + r.clicks,
        conversions: acc.conversions + r.conversions,
        earnings: acc.earnings + r.totalEarnings,
      }),
      { clicks: 0, conversions: 0, earnings: 0 },
    );

    return { referrals, totals };
  }
}
