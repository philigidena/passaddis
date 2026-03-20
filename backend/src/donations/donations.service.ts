import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a donation for an event
   */
  async donate(
    userId: string,
    eventId: string,
    amount: number,
    message?: string,
    isAnonymous = false,
  ) {
    if (amount < 1) throw new BadRequestException('Minimum donation is 1 ETB');

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, donationsEnabled: true, title: true },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (!event.donationsEnabled) throw new BadRequestException('Donations not enabled for this event');

    return this.prisma.donation.create({
      data: {
        userId,
        eventId,
        amount,
        message,
        isAnonymous,
      },
    });
  }

  /**
   * Get donation summary for an event
   */
  async getEventDonations(eventId: string) {
    const [donations, aggregate] = await Promise.all([
      this.prisma.donation.findMany({
        where: { eventId },
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.donation.aggregate({
        where: { eventId },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { donationGoal: true },
    });

    return {
      donations: donations.map((d) => ({
        ...d,
        user: d.isAnonymous ? { id: d.userId, name: 'Anonymous' } : d.user,
      })),
      totalAmount: aggregate._sum.amount || 0,
      donorCount: aggregate._count,
      goal: event?.donationGoal || null,
      progress: event?.donationGoal
        ? ((aggregate._sum.amount || 0) / event.donationGoal) * 100
        : null,
    };
  }

  /**
   * Get user's donations
   */
  async getMyDonations(userId: string) {
    return this.prisma.donation.findMany({
      where: { userId },
      include: {
        event: { select: { id: true, title: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
