import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AfroSmsProvider } from '../auth/providers/afro-sms.provider';
import {
  CreateOrganizerProfileDto,
  UpdateOrganizerProfileDto,
  CreateEventDto,
  UpdateEventDto,
} from './dto/organizer.dto';

@Injectable()
export class OrganizerService {
  constructor(
    private prisma: PrismaService,
    private smsProvider: AfroSmsProvider,
  ) {}

  // ==================== PROFILE MANAGEMENT ====================

  async getProfile(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!merchant) {
      // Check legacy organizer table
      const organizer = await this.prisma.organizer.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      if (organizer) {
        return { ...organizer, isMerchant: false };
      }

      return null;
    }

    return { ...merchant, isMerchant: true };
  }

  async createProfile(userId: string, dto: CreateOrganizerProfileDto) {
    // Check if user already has a profile
    const existing = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Organizer profile already exists');
    }

    // Generate unique merchant code
    const count = await this.prisma.merchant.count();
    const merchantCode = `PA${String(count + 1).padStart(4, '0')}`;

    // Create merchant profile
    const merchant = await this.prisma.merchant.create({
      data: {
        merchantCode,
        businessName: dto.businessName,
        tradeName: dto.tradeName,
        description: dto.description,
        logo: dto.logo,
        type: 'ORGANIZER',
        status: 'PENDING',
        tinNumber: dto.tinNumber,
        licenseNumber: dto.licenseNumber,
        businessAddress: dto.businessAddress,
        city: dto.city || 'Addis Ababa',
        bankName: dto.bankName,
        bankAccount: dto.bankAccount,
        telebirrAccount: dto.telebirrAccount,
        userId,
      },
    });

    // Update user role to ORGANIZER
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ORGANIZER' },
    });

    return merchant;
  }

  async updateProfile(userId: string, dto: UpdateOrganizerProfileDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    return this.prisma.merchant.update({
      where: { userId },
      data: dto,
    });
  }

  // ==================== DASHBOARD ====================

  async getDashboard(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found. Please create one first.');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get event stats
    const eventStats = await this.prisma.event.groupBy({
      by: ['status'],
      where: { merchantId: merchant.id },
      _count: true,
    });

    // Get all events for this organizer
    const events = await this.prisma.event.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });
    const eventIds = events.map((e) => e.id);

    // Get ticket stats
    const ticketStats = await this.prisma.ticket.aggregate({
      where: { eventId: { in: eventIds } },
      _count: true,
    });

    // Get revenue (from orders with these tickets)
    const revenue = await this.prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        tickets: { some: { eventId: { in: eventIds } } },
      },
      _sum: { subtotal: true },
    });

    // Monthly stats
    const monthlyTickets = await this.prisma.ticket.count({
      where: {
        eventId: { in: eventIds },
        createdAt: { gte: startOfMonth },
      },
    });

    const monthlyRevenue = await this.prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        tickets: { some: { eventId: { in: eventIds } } },
        createdAt: { gte: startOfMonth },
      },
      _sum: { subtotal: true },
    });

    // Wallet transactions
    const walletBalance = await this.prisma.walletTransaction.aggregate({
      where: { merchantId: merchant.id },
      _sum: { netAmount: true },
    });

    const pendingSettlement = await this.prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        settledAt: null,
        tickets: { some: { eventId: { in: eventIds } } },
      },
      _sum: { merchantAmount: true },
    });

    // Build response
    const statusCounts = eventStats.reduce(
      (acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      },
      {
        draft: 0,
        pending: 0,
        approved: 0,
        published: 0,
        rejected: 0,
        cancelled: 0,
        completed: 0,
      } as Record<string, number>,
    );

    return {
      profile: {
        id: merchant.id,
        businessName: merchant.businessName,
        status: merchant.status,
        isVerified: merchant.isVerified,
        commissionRate: merchant.commissionRate,
      },
      events: {
        total: events.length,
        ...statusCounts,
      },
      tickets: {
        totalSold: ticketStats._count,
        revenue: revenue._sum.subtotal || 0,
        thisMonth: {
          sold: monthlyTickets,
          revenue: monthlyRevenue._sum.subtotal || 0,
        },
      },
      wallet: {
        balance: walletBalance._sum.netAmount || 0,
        pendingSettlement: pendingSettlement._sum.merchantAmount || 0,
        totalEarnings: revenue._sum.subtotal || 0,
      },
    };
  }

  // ==================== WALLET ====================

  async getWallet(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    // Get all events for this organizer
    const events = await this.prisma.event.findMany({
      where: { merchantId: merchant.id },
      select: { id: true },
    });
    const eventIds = events.map((e) => e.id);

    // Calculate wallet balance from transactions
    const walletBalance = await this.prisma.walletTransaction.aggregate({
      where: { merchantId: merchant.id },
      _sum: { netAmount: true },
    });

    // Calculate pending settlement (paid orders not yet settled)
    const pendingSettlement = await this.prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        settledAt: null,
        tickets: { some: { eventId: { in: eventIds } } },
      },
      _sum: { merchantAmount: true },
    });

    // Total revenue (all time)
    const totalRevenue = await this.prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        tickets: { some: { eventId: { in: eventIds } } },
      },
      _sum: { subtotal: true },
    });

    // Total withdrawn (DEBIT = money out)
    const totalWithdrawn = await this.prisma.walletTransaction.aggregate({
      where: {
        merchantId: merchant.id,
        type: 'DEBIT',
      },
      _sum: { amount: true },
    });

    return {
      available: walletBalance._sum.netAmount || 0,
      pending: pendingSettlement._sum.merchantAmount || 0,
      totalEarnings: totalRevenue._sum.subtotal || 0,
      totalWithdrawn: Math.abs(totalWithdrawn?._sum?.amount || 0),
    };
  }

  async getWalletTransactions(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    // Get wallet transactions
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      netAmount: tx.netAmount,
      commission: tx.fee, // fee is the commission/platform fee
      description: tx.description,
      status: 'COMPLETED',
      createdAt: tx.createdAt,
      eventName: null, // Would need to lookup from reference if needed
    }));
  }

  async getSettlements(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    // Get settlement records
    const settlements = await this.prisma.settlement.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return settlements.map((s) => ({
      id: s.id,
      amount: s.amount,
      status: s.status,
      bankName: merchant.bankName || 'Not specified',
      accountNumber: merchant.bankAccount
        ? `****${merchant.bankAccount.slice(-4)}`
        : 'N/A',
      requestedAt: s.createdAt,
      completedAt: s.processedAt,
    }));
  }

  // ==================== EVENT MANAGEMENT ====================

  async getMyEvents(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    return this.prisma.event.findMany({
      where: { merchantId: merchant.id },
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
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEvent(userId: string, eventId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this event');
    }

    return event;
  }

  async createEvent(userId: string, dto: CreateEventDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException(
        'Organizer profile not found. Please create one first.',
      );
    }

    const { ticketTypes, ...eventData } = dto;

    const event = await this.prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        imageUrl: eventData.imageUrl,
        venue: eventData.venue,
        address: eventData.address,
        city: eventData.city || 'Addis Ababa',
        date: new Date(eventData.date),
        endDate: eventData.endDate ? new Date(eventData.endDate) : null,
        category: eventData.category as any,
        status: 'DRAFT',
        merchantId: merchant.id,
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

  async updateEvent(userId: string, eventId: string, dto: UpdateEventDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this event');
    }

    // Don't allow editing published events (only certain fields)
    if (event.status === 'PUBLISHED') {
      const allowedFields = ['imageUrl'];
      const attemptedFields = Object.keys(dto);
      const disallowedFields = attemptedFields.filter(
        (f) => !allowedFields.includes(f),
      );

      if (disallowedFields.length > 0) {
        throw new BadRequestException(
          'Cannot edit published events. Only image can be updated.',
        );
      }
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        category: dto.category as any,
      },
      include: {
        ticketTypes: true,
      },
    });
  }

  async submitEventForApproval(userId: string, eventId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTypes: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this event');
    }

    if (event.status !== 'DRAFT' && event.status !== 'REJECTED') {
      throw new BadRequestException(
        'Only draft or rejected events can be submitted for approval',
      );
    }

    // Validate event has ticket types
    if (event.ticketTypes.length === 0) {
      throw new BadRequestException(
        'Event must have at least one ticket type',
      );
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'PENDING',
        submittedAt: new Date(),
        rejectionReason: null,
      },
      include: {
        ticketTypes: true,
      },
    });
  }

  async publishEvent(userId: string, eventId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this event');
    }

    if (event.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved events can be published',
      );
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: { status: 'PUBLISHED' },
      include: {
        ticketTypes: true,
      },
    });
  }

  async cancelEvent(userId: string, eventId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: {
          include: {
            order: {
              include: {
                payment: true,
              },
            },
            user: {
              select: {
                id: true,
                phone: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this event');
    }

    // Check if event can be cancelled (not in the past, not already cancelled)
    if (event.status === 'CANCELLED') {
      throw new BadRequestException('Event is already cancelled');
    }

    const now = new Date();
    if (new Date(event.date) < now) {
      throw new BadRequestException('Cannot cancel past events');
    }

    // Perform cancellation in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Cancel the event
      const cancelledEvent = await tx.event.update({
        where: { id: eventId },
        data: {
          status: 'CANCELLED',
          cancelledAt: now,
        },
      });

      // If there are sold tickets, initiate refunds
      if (event.tickets && event.tickets.length > 0) {
        // Get unique orders that need refunds
        const ordersToRefund = new Map<string, any>();
        event.tickets.forEach((ticket) => {
          if (ticket.order && ticket.order.status === 'PAID' && ticket.order.payment) {
            ordersToRefund.set(ticket.order.id, ticket.order);
          }
        });

        // Mark tickets as cancelled
        await tx.ticket.updateMany({
          where: { eventId },
          data: {
            status: 'CANCELLED',
          },
        });

        // Initiate refunds for all paid orders
        const refundPromises = Array.from(ordersToRefund.values()).map(async (order) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'CANCELLED',
              refundStatus: 'PENDING',
              refundAmount: order.total,
              cancelledAt: now,
              cancelledBy: 'organizer',
              cancellationReason: 'Event cancelled by organizer',
            },
          });

          // Create a wallet transaction deducting from merchant
          await tx.walletTransaction.create({
            data: {
              merchantId: merchant.id,
              orderId: order.id,
              amount: order.total,
              netAmount: -order.total, // Deduct full amount
              balanceBefore: 0,  // Will be calculated by finance team
              balanceAfter: 0,   // Will be calculated by finance team
              type: 'REFUND',
              status: 'PENDING',
              description: `Refund for cancelled event: ${event.title}`,
            },
          });
        });

        await Promise.all(refundPromises);

        // Send cancellation notifications to all ticket holders
        const uniqueUsers = new Map<string, any>();
        event.tickets.forEach((ticket) => {
          if (ticket.user && ticket.user.phone) {
            uniqueUsers.set(ticket.user.id, ticket.user);
          }
        });

        const notificationPromises = Array.from(uniqueUsers.values()).map(async (user) => {
          try {
            await this.smsProvider.sendEventCancellationNotification(
              user.phone,
              event.title,
            );
            console.log(`✅ Cancellation notification sent to ${user.phone}`);
          } catch (error) {
            console.error(`❌ Failed to send cancellation notification to ${user.phone}:`, error);
          }
        });

        // Don't wait for notifications (send in background)
        Promise.all(notificationPromises).catch((error) => {
          console.error('Error sending cancellation notifications:', error);
        });

        console.log(`🔄 Event "${event.title}" cancelled. ${ordersToRefund.size} orders marked for refund, ${uniqueUsers.size} customers notified.`);
      }

      return {
        ...cancelledEvent,
        refundsInitiated: event.tickets ? event.tickets.length : 0,
      };
    });
  }

  // ==================== ATTENDEES ====================

  async getEventAttendees(userId: string, eventId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this event');
    }

    const tickets = await this.prisma.ticket.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        ticketType: {
          select: {
            name: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by status
    const stats = {
      total: tickets.length,
      valid: tickets.filter((t) => t.status === 'VALID').length,
      used: tickets.filter((t) => t.status === 'USED').length,
      cancelled: tickets.filter((t) => t.status === 'CANCELLED').length,
    };

    return {
      stats,
      attendees: tickets,
    };
  }

  // ==================== TICKET TYPE MANAGEMENT ====================

  async addTicketType(userId: string, eventId: string, dto: any) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this event');
    }

    if (event.status === 'PUBLISHED') {
      throw new BadRequestException(
        'Cannot add ticket types to published events',
      );
    }

    return this.prisma.ticketType.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        quantity: dto.quantity,
        maxPerOrder: dto.maxPerOrder || 10,
        eventId,
      },
    });
  }

  async updateTicketType(
    userId: string,
    eventId: string,
    ticketTypeId: string,
    dto: any,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.merchantId !== merchant.id) {
      throw new ForbiddenException('Event not found or access denied');
    }

    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!ticketType || ticketType.eventId !== eventId) {
      throw new NotFoundException('Ticket type not found');
    }

    // Don't allow changing price if tickets are sold
    if (dto.price && ticketType.sold > 0 && dto.price !== ticketType.price) {
      throw new BadRequestException(
        'Cannot change price for ticket type with sold tickets',
      );
    }

    return this.prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: dto,
    });
  }

  async deleteTicketType(
    userId: string,
    eventId: string,
    ticketTypeId: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer profile not found');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.merchantId !== merchant.id) {
      throw new ForbiddenException('Event not found or access denied');
    }

    const ticketType = await this.prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!ticketType || ticketType.eventId !== eventId) {
      throw new NotFoundException('Ticket type not found');
    }

    if (ticketType.sold > 0) {
      throw new BadRequestException(
        'Cannot delete ticket type with sold tickets',
      );
    }

    return this.prisma.ticketType.delete({
      where: { id: ticketTypeId },
    });
  }
}
