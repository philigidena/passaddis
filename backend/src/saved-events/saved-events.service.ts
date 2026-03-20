import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedEventsService {
  constructor(private prisma: PrismaService) {}

  async saveEvent(userId: string, eventId: string) {
    // Verify event exists and is published
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      await this.prisma.savedEvent.create({
        data: { userId, eventId },
      });
      return { saved: true, message: 'Event saved successfully' };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Event already saved');
      }
      throw error;
    }
  }

  async unsaveEvent(userId: string, eventId: string) {
    const saved = await this.prisma.savedEvent.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (!saved) {
      throw new NotFoundException('Saved event not found');
    }

    await this.prisma.savedEvent.delete({
      where: { userId_eventId: { userId, eventId } },
    });

    return { saved: false, message: 'Event removed from saved' };
  }

  async getSavedEvents(userId: string) {
    const saved = await this.prisma.savedEvent.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                businessName: true,
                logo: true,
              },
            },
            ticketTypes: {
              select: {
                id: true,
                name: true,
                price: true,
                quantity: true,
                sold: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map((s) => ({
      ...s.event,
      savedAt: s.createdAt,
      ticketTypes: s.event.ticketTypes.map((t) => ({
        ...t,
        available: t.quantity - t.sold,
      })),
      minPrice: s.event.ticketTypes.length
        ? Math.min(...s.event.ticketTypes.map((t) => t.price))
        : 0,
      maxPrice: s.event.ticketTypes.length
        ? Math.max(...s.event.ticketTypes.map((t) => t.price))
        : 0,
      ticketsAvailable: s.event.ticketTypes.reduce(
        (sum, t) => sum + (t.quantity - t.sold),
        0,
      ),
    }));
  }

  async isEventSaved(userId: string, eventId: string) {
    const saved = await this.prisma.savedEvent.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    return { saved: !!saved };
  }

  async getSavedEventIds(userId: string) {
    const saved = await this.prisma.savedEvent.findMany({
      where: { userId },
      select: { eventId: true },
    });
    return { eventIds: saved.map((s) => s.eventId) };
  }
}
