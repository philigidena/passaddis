import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromotersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a promoter profile
   */
  async createProfile(userId: string, data: {
    stageName: string;
    bio?: string;
    photo?: string;
    category: string;
    phone?: string;
    email?: string;
    socialLinks?: Record<string, string>;
  }) {
    const existing = await this.prisma.promoter.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Promoter profile already exists');

    return this.prisma.promoter.create({
      data: {
        ...data,
        category: data.category as any,
        socialLinks: data.socialLinks as any,
        userId,
      },
    });
  }

  /**
   * Update promoter profile
   */
  async updateProfile(userId: string, data: Partial<{
    stageName: string;
    bio: string;
    photo: string;
    category: string;
    phone: string;
    email: string;
    socialLinks: Record<string, string>;
    isAvailable: boolean;
  }>) {
    const promoter = await this.prisma.promoter.findUnique({ where: { userId } });
    if (!promoter) throw new NotFoundException('Promoter profile not found');

    return this.prisma.promoter.update({
      where: { userId },
      data: {
        ...data,
        category: data.category as any,
        socialLinks: data.socialLinks as any,
      },
    });
  }

  /**
   * Get promoter profile by user ID
   */
  async getProfile(userId: string) {
    const promoter = await this.prisma.promoter.findUnique({
      where: { userId },
      include: {
        assignments: {
          include: {
            event: {
              select: { id: true, title: true, date: true, venue: true, imageUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!promoter) throw new NotFoundException('Promoter profile not found');
    return promoter;
  }

  /**
   * List all available promoters (for organizers to browse)
   */
  async listPromoters(filters?: {
    category?: string;
    search?: string;
    availableOnly?: boolean;
  }) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.availableOnly !== false) {
      where.isAvailable = true;
    }
    if (filters?.search) {
      where.OR = [
        { stageName: { contains: filters.search, mode: 'insensitive' } },
        { bio: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.promoter.findMany({
      where,
      select: {
        id: true,
        stageName: true,
        bio: true,
        photo: true,
        category: true,
        rating: true,
        totalEvents: true,
        isAvailable: true,
        socialLinks: true,
      },
      orderBy: [{ rating: 'desc' }, { totalEvents: 'desc' }],
    });
  }

  /**
   * Assign a promoter to an event (organizer action)
   */
  async assignToEvent(
    organizerId: string,
    eventId: string,
    promoterId: string,
    data: { role?: string; fee?: number; notes?: string },
  ) {
    // Verify the event belongs to this organizer
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, title: true },
    });

    if (!event || event.organizerId !== organizerId) {
      throw new NotFoundException('Event not found');
    }

    // Check promoter exists
    const promoter = await this.prisma.promoter.findUnique({
      where: { id: promoterId },
      select: { id: true, stageName: true },
    });

    if (!promoter) throw new NotFoundException('Promoter not found');

    // Check not already assigned
    const existing = await this.prisma.eventPromoter.findUnique({
      where: { promoterId_eventId: { promoterId, eventId } },
    });

    if (existing) throw new BadRequestException('Promoter already assigned to this event');

    return this.prisma.eventPromoter.create({
      data: {
        promoterId,
        eventId,
        role: data.role || 'PERFORMER',
        fee: data.fee,
        notes: data.notes,
      },
      include: {
        promoter: { select: { id: true, stageName: true, photo: true, category: true } },
      },
    });
  }

  /**
   * Remove a promoter from an event
   */
  async removeFromEvent(organizerId: string, eventId: string, promoterId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== organizerId) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.eventPromoter.deleteMany({
      where: { promoterId, eventId },
    });

    return { removed: true };
  }

  /**
   * Get promoters assigned to an event
   */
  async getEventPromoters(eventId: string) {
    return this.prisma.eventPromoter.findMany({
      where: { eventId },
      include: {
        promoter: {
          select: {
            id: true,
            stageName: true,
            photo: true,
            category: true,
            bio: true,
            socialLinks: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Promoter responds to an assignment (confirm/decline)
   */
  async respondToAssignment(userId: string, assignmentId: string, accept: boolean) {
    const promoter = await this.prisma.promoter.findUnique({ where: { userId } });
    if (!promoter) throw new NotFoundException('Promoter profile not found');

    const assignment = await this.prisma.eventPromoter.findFirst({
      where: { id: assignmentId, promoterId: promoter.id },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    return this.prisma.eventPromoter.update({
      where: { id: assignmentId },
      data: {
        status: accept ? 'CONFIRMED' : 'DECLINED',
        confirmedAt: accept ? new Date() : undefined,
      },
    });
  }

  /**
   * Get promoter's upcoming assignments
   */
  async getMyAssignments(userId: string) {
    const promoter = await this.prisma.promoter.findUnique({ where: { userId } });
    if (!promoter) throw new NotFoundException('Promoter profile not found');

    return this.prisma.eventPromoter.findMany({
      where: { promoterId: promoter.id },
      include: {
        event: {
          select: {
            id: true, title: true, date: true, endDate: true,
            venue: true, city: true, imageUrl: true, category: true,
            organizer: { select: { businessName: true } },
          },
        },
      },
      orderBy: { event: { date: 'asc' } },
    });
  }
}
