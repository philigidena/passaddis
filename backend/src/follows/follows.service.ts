import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Follow an organizer
   */
  async follow(userId: string, organizerId: string) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { id: organizerId },
      select: { id: true, businessName: true },
    });

    if (!organizer) throw new NotFoundException('Organizer not found');

    const existing = await this.prisma.organizerFollow.findUnique({
      where: { userId_organizerId: { userId, organizerId } },
    });

    if (existing) return { followed: true, message: 'Already following' };

    await this.prisma.organizerFollow.create({
      data: { userId, organizerId },
    });

    return { followed: true, message: `Now following ${organizer.businessName}` };
  }

  /**
   * Unfollow an organizer
   */
  async unfollow(userId: string, organizerId: string) {
    await this.prisma.organizerFollow.deleteMany({
      where: { userId, organizerId },
    });

    return { followed: false, message: 'Unfollowed' };
  }

  /**
   * Check if user follows an organizer
   */
  async isFollowing(userId: string, organizerId: string) {
    const follow = await this.prisma.organizerFollow.findUnique({
      where: { userId_organizerId: { userId, organizerId } },
    });
    return { following: !!follow };
  }

  /**
   * Get followed organizers for a user
   */
  async getFollowing(userId: string) {
    const follows = await this.prisma.organizerFollow.findMany({
      where: { userId },
      include: {
        organizer: {
          select: {
            id: true,
            businessName: true,
            logo: true,
            description: true,
            _count: { select: { events: true, followers: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return follows.map((f) => ({
      ...f.organizer,
      followedAt: f.createdAt,
    }));
  }

  /**
   * Get follower count for an organizer
   */
  async getFollowerCount(organizerId: string) {
    const count = await this.prisma.organizerFollow.count({
      where: { organizerId },
    });
    return { organizerId, followerCount: count };
  }

  /**
   * Notify followers when organizer publishes a new event
   */
  async notifyFollowers(organizerId: string, eventId: string, eventTitle: string) {
    const followers = await this.prisma.organizerFollow.findMany({
      where: { organizerId },
      select: { userId: true },
    });

    const organizer = await this.prisma.organizer.findUnique({
      where: { id: organizerId },
      select: { businessName: true },
    });

    for (const follower of followers) {
      await this.notificationsService.create(
        follower.userId,
        'SYSTEM',
        'New Event from an Organizer You Follow',
        `${organizer?.businessName} just published "${eventTitle}". Check it out!`,
        { eventId, organizerId },
      );
    }

    return { notified: followers.length };
  }

  /**
   * Get organizer public profile
   */
  async getOrganizerPublicProfile(organizerId: string) {
    const organizer = await this.prisma.organizer.findUnique({
      where: { id: organizerId },
      select: {
        id: true,
        businessName: true,
        description: true,
        logo: true,
        website: true,
        socialLinks: true,
        bannerImage: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { followers: true, events: true } },
      },
    });

    if (!organizer) throw new NotFoundException('Organizer not found');

    // Get upcoming events
    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        organizerId,
        status: 'PUBLISHED',
        date: { gte: new Date() },
      },
      include: {
        ticketTypes: {
          select: { price: true, quantity: true, sold: true },
        },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    // Get past events (last 10)
    const pastEvents = await this.prisma.event.findMany({
      where: {
        organizerId,
        status: { in: ['COMPLETED', 'PUBLISHED'] },
        date: { lt: new Date() },
      },
      orderBy: { date: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        date: true,
        venue: true,
        category: true,
      },
    });

    // Average rating
    const avgRating = await this.prisma.eventRating.aggregate({
      where: { event: { organizerId } },
      _avg: { rating: true },
      _count: true,
    });

    return {
      ...organizer,
      followerCount: organizer._count.followers,
      eventCount: organizer._count.events,
      upcomingEvents: upcomingEvents.map((e: any) => ({
        ...e,
        minPrice: e.ticketTypes.length > 0
          ? Math.min(...e.ticketTypes.map((t: any) => t.price))
          : 0,
        ticketsAvailable: e.ticketTypes.reduce(
          (sum: number, t: any) => sum + (t.quantity - t.sold), 0,
        ),
      })),
      pastEvents,
      averageRating: avgRating._avg.rating || 0,
      totalRatings: avgRating._count,
    };
  }
}
