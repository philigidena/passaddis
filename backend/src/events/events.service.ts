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

  // Generate calendar links for an event
  async getCalendarLinks(id: string) {
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
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours
    const location = [event.venue, event.address, event.city].filter(Boolean).join(', ');
    const description = event.description.substring(0, 500);

    // Google Calendar
    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${this.toCalendarDate(startDate)}/${this.toCalendarDate(endDate)}`,
      details: description,
      location,
    });
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

    // Outlook / Office 365
    const outlookParams = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: description,
      location,
    });
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;

    // Yahoo Calendar
    const yahooParams = new URLSearchParams({
      v: '60',
      title: event.title,
      st: this.toCalendarDate(startDate),
      et: this.toCalendarDate(endDate),
      desc: description,
      in_loc: location,
    });
    const yahooUrl = `https://calendar.yahoo.com/?${yahooParams.toString()}`;

    return {
      eventId: event.id,
      eventTitle: event.title,
      googleCalendarUrl,
      outlookUrl,
      yahooUrl,
      icsUrl: `/api/events/${id}/calendar/ics`,
    };
  }

  // Generate .ics file content
  async generateIcsFile(id: string) {
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
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
    const location = [event.venue, event.address, event.city].filter(Boolean).join(', ');
    const now = new Date();

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PassAddis//Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@passaddis.com`,
      `DTSTAMP:${this.toCalendarDate(now)}`,
      `DTSTART:${this.toCalendarDate(startDate)}`,
      `DTEND:${this.toCalendarDate(endDate)}`,
      `SUMMARY:${this.escapeIcs(event.title)}`,
      `DESCRIPTION:${this.escapeIcs(event.description.substring(0, 500))}`,
      `LOCATION:${this.escapeIcs(location)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;

    return { filename, content: icsContent };
  }

  // Format date for iCal (YYYYMMDDTHHmmssZ)
  private toCalendarDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  // Escape special characters for .ics format
  private escapeIcs(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
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

  // Get Open Graph data for social sharing
  async getOpenGraphData(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true, title: true, description: true, imageUrl: true,
        date: true, venue: true, city: true,
        ticketTypes: { select: { price: true } },
      },
    });

    if (!event) throw new NotFoundException('Event not found');

    const frontendUrl = process.env.FRONTEND_URL || 'https://passaddis.com';
    const minPrice = event.ticketTypes.length > 0
      ? Math.min(...event.ticketTypes.map((t: any) => t.price))
      : 0;
    const dateStr = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

    return {
      title: event.title,
      description: `${dateStr} at ${event.venue}, ${event.city}${minPrice > 0 ? ` | From ${minPrice} ETB` : ' | Free'}`,
      image: event.imageUrl || `${frontendUrl}/og-image.png`,
      url: `${frontendUrl}/events/${event.id}`,
    };
  }

  // Get social share links
  async getShareLinks(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, title: true, venue: true, date: true },
    });

    if (!event) throw new NotFoundException('Event not found');

    const frontendUrl = process.env.FRONTEND_URL || 'https://passaddis.com';
    const eventUrl = `${frontendUrl}/events/${event.id}`;
    const text = `${event.title} — ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${event.venue}`;
    const encodedUrl = encodeURIComponent(eventUrl);
    const encodedText = encodeURIComponent(text);

    return {
      eventId: event.id,
      url: eventUrl,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${eventUrl}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      copyLink: eventUrl,
    };
  }

  /**
   * Get diaspora-friendly events — curated picks for gifting/remote attendance
   * Prioritizes: cultural events, festivals, concerts, events with gift-friendly pricing
   */
  async getDiasporaPicks(limit = 8) {
    const events = await this.prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        date: { gte: new Date() },
        category: { in: ['MUSIC', 'FESTIVAL', 'ARTS', 'COMEDY', 'CONFERENCE'] as any },
      },
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
      orderBy: [
        { isFeatured: 'desc' },
        { date: 'asc' },
      ],
      take: limit,
    });

    return events.map((event) => ({
      ...event,
      ticketTypes: event.ticketTypes.map((t: any) => ({
        ...t,
        available: t.quantity - t.sold,
      })),
      minPrice: event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map((t: any) => t.price))
        : 0,
      maxPrice: event.ticketTypes.length > 0
        ? Math.max(...event.ticketTypes.map((t: any) => t.price))
        : 0,
      ticketsAvailable: event.ticketTypes.reduce(
        (sum: number, t: any) => sum + (t.quantity - t.sold),
        0,
      ),
    }));
  }

  /**
   * Get event recommendations for a user
   * Based on: purchase history categories, saved events, and popular events
   */
  async getRecommendations(userId?: string, limit = 8) {
    let preferredCategories: string[] = [];

    if (userId) {
      // Get categories from user's past tickets
      const userTickets = await this.prisma.ticket.findMany({
        where: { userId, status: { in: ['VALID', 'USED'] } },
        select: { event: { select: { category: true } } },
        take: 50,
      });

      const categoryCount: Record<string, number> = {};
      for (const ticket of userTickets) {
        const cat = ticket.event.category;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }

      preferredCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .map(([cat]) => cat);

      // Include categories from saved events
      const savedEvents = await this.prisma.savedEvent.findMany({
        where: { userId },
        select: { event: { select: { category: true } } },
        take: 20,
      });

      for (const saved of savedEvents) {
        const cat = saved.event.category;
        if (!preferredCategories.includes(cat)) {
          preferredCategories.push(cat);
        }
      }
    }

    const where: any = {
      status: 'PUBLISHED',
      date: { gte: new Date() },
    };

    if (preferredCategories.length > 0) {
      where.category = { in: preferredCategories as any };
    }

    // Exclude events user already has tickets for
    if (userId) {
      const userEventIds = await this.prisma.ticket.findMany({
        where: { userId },
        select: { eventId: true },
        distinct: ['eventId'],
      });
      if (userEventIds.length > 0) {
        where.id = { notIn: userEventIds.map((t: any) => t.eventId) };
      }
    }

    const events = await this.prisma.event.findMany({
      where,
      include: {
        organizer: { select: { id: true, businessName: true, logo: true } },
        ticketTypes: {
          select: { id: true, name: true, price: true, quantity: true, sold: true },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { date: 'asc' }],
      take: limit,
    });

    // Backfill with popular events if not enough
    if (events.length < limit && userId) {
      const existingIds = events.map((e) => e.id);
      const backfill = await this.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          date: { gte: new Date() },
          id: { notIn: existingIds },
        },
        include: {
          organizer: { select: { id: true, businessName: true, logo: true } },
          ticketTypes: {
            select: { id: true, name: true, price: true, quantity: true, sold: true },
          },
        },
        orderBy: { date: 'asc' },
        take: limit - events.length,
      });
      events.push(...backfill);
    }

    return events.map((event: any) => ({
      ...event,
      ticketTypes: event.ticketTypes.map((t: any) => ({
        ...t,
        available: t.quantity - t.sold,
      })),
      minPrice: event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map((t: any) => t.price))
        : 0,
      maxPrice: event.ticketTypes.length > 0
        ? Math.max(...event.ticketTypes.map((t: any) => t.price))
        : 0,
      ticketsAvailable: event.ticketTypes.reduce(
        (sum: number, t: any) => sum + (t.quantity - t.sold),
        0,
      ),
    }));
  }
}
