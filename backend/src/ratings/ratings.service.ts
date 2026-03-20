import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rate an event (only if user attended)
   */
  async rateEvent(
    userId: string,
    eventId: string,
    rating: number,
    review?: string,
    isAnonymous = false,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    // Verify user had a ticket
    const ticket = await this.prisma.ticket.findFirst({
      where: { userId, eventId, status: { in: ['VALID', 'USED'] } },
    });

    if (!ticket) {
      throw new BadRequestException('You must have attended this event to rate it');
    }

    // Upsert rating
    return this.prisma.eventRating.upsert({
      where: { userId_eventId: { userId, eventId } },
      create: { userId, eventId, rating, review, isAnonymous },
      update: { rating, review, isAnonymous },
    });
  }

  /**
   * Get ratings for an event
   */
  async getEventRatings(eventId: string, page = 1, limit = 20) {
    const [ratings, total, aggregate] = await Promise.all([
      this.prisma.eventRating.findMany({
        where: { eventId },
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.eventRating.count({ where: { eventId } }),
      this.prisma.eventRating.aggregate({
        where: { eventId },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    // Distribution (1-5 stars)
    const distribution = await this.prisma.eventRating.groupBy({
      by: ['rating'],
      where: { eventId },
      _count: true,
    });

    const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of distribution) {
      distMap[d.rating] = d._count;
    }

    return {
      ratings: ratings.map((r) => ({
        ...r,
        user: r.isAnonymous ? { id: r.userId, name: 'Anonymous' } : r.user,
      })),
      averageRating: aggregate._avg.rating || 0,
      totalRatings: aggregate._count,
      distribution: distMap,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get user's rating for an event
   */
  async getUserRating(userId: string, eventId: string) {
    return this.prisma.eventRating.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
  }
}
