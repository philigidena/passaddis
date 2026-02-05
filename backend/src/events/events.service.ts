import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppProvider } from '../shared/providers/whatsapp.provider';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
} from './dto/events.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private whatsAppProvider: WhatsAppProvider,
  ) {}

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
      ticketTypes: event.ticketTypes.map((t) => ({
        ...t,
        available: t.quantity - t.sold,
      })),
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
      ticketTypes: event.ticketTypes.map((t) => ({
        ...t,
        available: t.quantity - t.sold,
      })),
      minPrice: Math.min(...event.ticketTypes.map((t) => t.price)),
      maxPrice: Math.max(...event.ticketTypes.map((t) => t.price)),
      ticketsAvailable: event.ticketTypes.reduce(
        (sum, t) => sum + (t.quantity - t.sold),
        0,
      ),
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
        ticketTypes: {
          include: {
            pricingTiers: {
              where: { isActive: true },
              orderBy: { priority: 'desc' },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Calculate current prices for each ticket type
    const ticketTypesWithPricing = event.ticketTypes.map((t) => {
      const currentPricing = this.getCurrentPriceForTicketType(t);
      return {
        ...t,
        available: t.quantity - t.sold,
        currentPrice: currentPricing.price,
        currentTier: currentPricing.tierName,
        tierEndsAt: currentPricing.tierEndsAt,
        hasEarlyBird: t.pricingTiers.length > 0,
      };
    });

    const currentPrices = ticketTypesWithPricing.map((t) => t.currentPrice);

    return {
      ...event,
      ticketTypes: ticketTypesWithPricing,
      minPrice: Math.min(...currentPrices),
      maxPrice: Math.max(...currentPrices),
      ticketsAvailable: event.ticketTypes.reduce(
        (sum, t) => sum + (t.quantity - t.sold),
        0,
      ),
    };
  }

  // Helper to calculate current price for a ticket type with pricing tiers
  private getCurrentPriceForTicketType(ticketType: any): {
    price: number;
    tierName: string;
    tierEndsAt?: Date;
  } {
    const now = new Date();

    // Check each tier in priority order (already sorted)
    for (const tier of ticketType.pricingTiers || []) {
      // Check date constraints
      if (tier.startsAt && now < new Date(tier.startsAt)) continue;
      if (tier.endsAt && now > new Date(tier.endsAt)) continue;

      // Check quantity constraints
      if (tier.maxQuantity && ticketType.sold >= tier.maxQuantity) continue;

      // This tier is active
      return {
        price: tier.price,
        tierName: tier.name,
        tierEndsAt: tier.endsAt || undefined,
      };
    }

    // Fallback to base price
    return {
      price: ticketType.price,
      tierName: 'Standard',
    };
  }

  // Get current price for a specific ticket type (public endpoint)
  async getTicketTypePrice(ticketTypeId: string) {
    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        pricingTiers: {
          where: { isActive: true },
          orderBy: { priority: 'desc' },
        },
        event: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    const pricing = this.getCurrentPriceForTicketType(ticketType);

    return {
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name,
      basePrice: ticketType.price,
      currentPrice: pricing.price,
      currentTier: pricing.tierName,
      tierEndsAt: pricing.tierEndsAt,
      available: ticketType.quantity - ticketType.sold,
      event: ticketType.event,
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

  // Get WhatsApp share link for an event
  async getWhatsAppShareLink(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        date: true,
        venue: true,
        status: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const shareLink = this.whatsAppProvider.generateEventShareLink(
      event.title,
      event.date,
      event.venue,
      event.id,
    );

    return {
      eventId: event.id,
      eventTitle: event.title,
      whatsappUrl: shareLink.url,
      shareMessage: shareLink.message,
    };
  }

  // Get WhatsApp support link
  async getWhatsAppSupportLink(subject?: string, orderId?: string) {
    return this.whatsAppProvider.generateSupportLink(subject, orderId);
  }
}
