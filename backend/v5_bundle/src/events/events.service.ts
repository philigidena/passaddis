import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
} from './dto/events.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Get all published events with filters
  async findAll(query: EventQueryDto) {
    const {
      search,
      category,
      city,
      featured,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {
      status: 'PUBLISHED',
      date: { gte: new Date() },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (featured) {
      where.isFeatured = true;
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
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
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    // Add computed fields
    const eventsWithStats = events.map((event) => ({
      ...event,
      minPrice: Math.min(...event.ticketTypes.map((t) => t.price)),
      maxPrice: Math.max(...event.ticketTypes.map((t) => t.price)),
      ticketsAvailable: event.ticketTypes.reduce(
        (sum, t) => sum + (t.quantity - t.sold),
        0,
      ),
    }));

    return {
      data: eventsWithStats,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get featured events
  async getFeatured() {
    const events = await this.prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true,
        date: { gte: new Date() },
      },
      include: {
        organizer: {
          select: {
            id: true,
            businessName: true,
          },
        },
        ticketTypes: {
          select: {
            price: true,
            quantity: true,
            sold: true,
          },
        },
      },
      orderBy: { date: 'asc' },
      take: 6,
    });

    return events.map((event) => ({
      ...event,
      minPrice: Math.min(...event.ticketTypes.map((t) => t.price)),
      maxPrice: Math.max(...event.ticketTypes.map((t) => t.price)),
    }));
  }

  // Get single event by ID
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            businessName: true,
            logo: true,
            description: true,
          },
        },
        ticketTypes: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      ...event,
      minPrice: Math.min(...event.ticketTypes.map((t) => t.price)),
      maxPrice: Math.max(...event.ticketTypes.map((t) => t.price)),
      ticketsAvailable: event.ticketTypes.reduce(
        (sum, t) => sum + (t.quantity - t.sold),
        0,
      ),
    };
  }

  // Create event (organizer only)
  async create(organizerId: string, dto: CreateEventDto) {
    const { ticketTypes, ...eventData } = dto;

    const event = await this.prisma.event.create({
      data: {
        ...eventData,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        organizerId,
        ticketTypes: {
          create: ticketTypes.map((tt) => ({
            name: tt.name,
            description: tt.description,
            price: tt.price,
            quantity: tt.quantity,
            maxPerOrder: tt.maxPerOrder || 10,
          })),
        },
      },
      include: {
        ticketTypes: true,
      },
    });

    return event;
  }

  // Update event (organizer only)
  async update(id: string, organizerId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You can only update your own events');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        ticketTypes: true,
      },
    });
  }

  // Get organizer's events
  async getOrganizerEvents(organizerId: string) {
    return this.prisma.event.findMany({
      where: { organizerId },
      include: {
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
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get event categories with counts
  async getCategories() {
    const categories = await this.prisma.event.groupBy({
      by: ['category'],
      where: {
        status: 'PUBLISHED',
        date: { gte: new Date() },
      },
      _count: true,
    });

    return categories.map((c) => ({
      category: c.category,
      count: c._count,
    }));
  }
}
