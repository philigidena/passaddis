import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JoinWaitlistDto } from './dto/waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(private prisma: PrismaService) {}

  // Join waitlist for an event
  async joinWaitlist(dto: JoinWaitlistDto, userId: string) {
    // Check if event exists and is published
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      include: {
        ticketTypes: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event is not available');
    }

    // Check if user already on waitlist
    const existingEntry = await this.prisma.waitlist.findUnique({
      where: {
        eventId_userId: {
          eventId: dto.eventId,
          userId,
        },
      },
    });

    if (existingEntry) {
      throw new ConflictException('You are already on the waitlist for this event');
    }

    // Verify ticket type if provided
    if (dto.ticketTypeId) {
      const ticketType = event.ticketTypes.find((t) => t.id === dto.ticketTypeId);
      if (!ticketType) {
        throw new BadRequestException('Invalid ticket type');
      }
    }

    // Get user for contact info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    });

    // Create waitlist entry
    const entry = await this.prisma.waitlist.create({
      data: {
        eventId: dto.eventId,
        userId,
        ticketTypeId: dto.ticketTypeId,
        email: dto.email || user?.email,
        phone: dto.phone || user?.phone,
      },
    });

    // Get position in waitlist
    const position = await this.getWaitlistPosition(dto.eventId, userId);

    return {
      ...entry,
      position,
      message: `You have been added to the waitlist at position ${position}`,
    };
  }

  // Leave waitlist
  async leaveWaitlist(eventId: string, userId: string) {
    const entry = await this.prisma.waitlist.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('You are not on the waitlist for this event');
    }

    await this.prisma.waitlist.delete({
      where: { id: entry.id },
    });

    return { message: 'You have been removed from the waitlist' };
  }

  // Get user's waitlist position
  async getWaitlistPosition(eventId: string, userId: string): Promise<number> {
    const entries = await this.prisma.waitlist.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
      select: { userId: true },
    });

    const index = entries.findIndex((e) => e.userId === userId);
    return index === -1 ? 0 : index + 1;
  }

  // Get user's waitlist status for an event
  async getWaitlistStatus(eventId: string, userId: string) {
    const entry = await this.prisma.waitlist.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!entry) {
      return { onWaitlist: false };
    }

    const position = await this.getWaitlistPosition(eventId, userId);

    return {
      onWaitlist: true,
      position,
      joinedAt: entry.createdAt,
      ticketTypeId: entry.ticketTypeId,
      notified: entry.notified,
    };
  }

  // Get user's all waitlist entries
  async getUserWaitlists(userId: string) {
    const entries = await this.prisma.waitlist.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
            imageUrl: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get positions for each
    const entriesWithPositions = await Promise.all(
      entries.map(async (entry) => {
        const position = await this.getWaitlistPosition(entry.eventId, userId);
        return { ...entry, position };
      }),
    );

    return entriesWithPositions;
  }

  // Organizer: Get waitlist for their event
  async getEventWaitlist(eventId: string, organizerId: string) {
    // Verify organizer owns the event
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        OR: [
          { organizer: { userId: organizerId } },
          { merchant: { userId: organizerId } },
        ],
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found or access denied');
    }

    const waitlist = await this.prisma.waitlist.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      eventId,
      totalWaiting: waitlist.length,
      entries: waitlist.map((entry, index) => ({
        ...entry,
        position: index + 1,
      })),
    };
  }

  // Internal: Notify waitlist when tickets become available
  async notifyWaitlist(eventId: string, availableTickets: number) {
    const waitlistEntries = await this.prisma.waitlist.findMany({
      where: {
        eventId,
        notified: false,
      },
      orderBy: { createdAt: 'asc' },
      take: availableTickets,
    });

    if (waitlistEntries.length === 0) {
      return { notified: 0 };
    }

    // Mark as notified
    await this.prisma.waitlist.updateMany({
      where: {
        id: { in: waitlistEntries.map((e) => e.id) },
      },
      data: {
        notified: true,
        notifiedAt: new Date(),
      },
    });

    // TODO: Send actual notifications (SMS/email)
    // For now, just mark them as notified
    // In production, integrate with SMS/email providers

    return {
      notified: waitlistEntries.length,
      entries: waitlistEntries.map((e) => ({
        userId: e.userId,
        email: e.email,
        phone: e.phone,
      })),
    };
  }
}
