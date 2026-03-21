import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicApiService {
  constructor(private prisma: PrismaService) {}

  async listEvents(page = 1, limit = 20) {
    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { status: 'PUBLISHED', date: { gte: new Date() } },
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          endDate: true,
          venue: true,
          address: true,
          city: true,
          imageUrl: true,
          category: true,
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
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({
        where: { status: 'PUBLISHED', date: { gte: new Date() } },
      }),
    ]);

    return {
      events,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getEvent(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        endDate: true,
        venue: true,
        address: true,
        city: true,
        imageUrl: true,
        category: true,
        donationsEnabled: true,
        donationGoal: true,
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
            quantity: true,
            sold: true,
            description: true,
          },
        },
        organizer: {
          select: {
            businessName: true,
            logo: true,
          },
        },
      },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async getAvailability(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        date: true,
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
    });

    if (!event) throw new NotFoundException('Event not found');

    const availability = event.ticketTypes.map((tt) => ({
      ticketTypeId: tt.id,
      name: tt.name,
      price: tt.price,
      total: tt.quantity,
      sold: tt.sold,
      available: tt.quantity - tt.sold,
      isAvailable: tt.sold < tt.quantity,
    }));

    return {
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      ticketTypes: availability,
      totalAvailable: availability.reduce((sum, a) => sum + a.available, 0),
    };
  }
}
