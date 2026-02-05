import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AfroSmsProvider } from '../auth/providers/afro-sms.provider';
import { EmailProvider } from '../auth/providers/email.provider';
import { WhatsAppProvider } from '../shared/providers/whatsapp.provider';
import { PurchaseTicketsDto, ValidateTicketDto } from './dto/tickets.dto';
import {
  InitiateTransferDto,
  ClaimTransferDto,
  CancelTransferDto,
} from './dto/transfer.dto';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

// Transfer expires after 48 hours
const TRANSFER_EXPIRY_HOURS = 48;

// Double-scan prevention window in milliseconds (5 seconds)
const SCAN_COOLDOWN_MS = 5000;

@Injectable()
export class TicketsService {
  // In-memory cache for recent scans to prevent double-scanning
  private recentScans = new Map<string, number>();
  private readonly frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private smsProvider: AfroSmsProvider,
    private emailProvider: EmailProvider,
    private whatsAppProvider: WhatsAppProvider,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';

    // Clean up old entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamp] of this.recentScans) {
        if (now - timestamp > SCAN_COOLDOWN_MS * 2) {
          this.recentScans.delete(key);
        }
      }
    }, 60000);
  }

  // Check if ticket was recently scanned (double-scan prevention)
  private isRecentlySscanned(qrCode: string): boolean {
    const lastScan = this.recentScans.get(qrCode);
    if (!lastScan) return false;
    return Date.now() - lastScan < SCAN_COOLDOWN_MS;
  }

  // Record a scan
  private recordScan(qrCode: string): void {
    this.recentScans.set(qrCode, Date.now());
  }

  // Generate unique transfer code
  private generateTransferCode(): string {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  // Generate unique QR code
  private generateQrCode(): string {
    return `PA-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
  }

  // Purchase tickets
  async purchaseTickets(userId: string, dto: PurchaseTicketsDto) {
    const { eventId, tickets } = dto;

    // Verify event exists and is published
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTypes: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event is not available for purchase');
    }

    if (new Date(event.date) < new Date()) {
      throw new BadRequestException('Event has already passed');
    }

    // Validate ticket types and availability
    let subtotal = 0;
    const ticketCreations: Array<{
      ticketTypeId: string;
      price: number;
      quantity: number;
    }> = [];

    for (const item of tickets) {
      const ticketType = event.ticketTypes.find(
        (tt) => tt.id === item.ticketTypeId,
      );

      if (!ticketType) {
        throw new NotFoundException(
          `Ticket type ${item.ticketTypeId} not found`,
        );
      }

      if (item.quantity > ticketType.maxPerOrder) {
        throw new BadRequestException(
          `Maximum ${ticketType.maxPerOrder} tickets per order for ${ticketType.name}`,
        );
      }

      const available = ticketType.quantity - ticketType.sold;
      if (item.quantity > available) {
        throw new ConflictException(
          `Only ${available} tickets available for ${ticketType.name}`,
        );
      }

      subtotal += ticketType.price * item.quantity;
      ticketCreations.push({
        ticketTypeId: ticketType.id,
        price: ticketType.price,
        quantity: item.quantity,
      });
    }

    // Calculate fees (5% service fee)
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + serviceFee;

    // Create order with ticket metadata (tickets created AFTER payment)
    const orderNumber = `PA${Date.now().toString(36).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        serviceFee,
        total,
        status: 'PENDING',
        // Store ticket details - tickets will be created after payment
        ticketMetadata: {
          eventId,
          tickets: ticketCreations,
        } as any,
      },
    });

    console.log(`📝 Order ${order.orderNumber} created - awaiting payment for ${ticketCreations.reduce((sum, t) => sum + t.quantity, 0)} tickets`);

    return {
      order,
      tickets: [], // No tickets until payment is confirmed
      paymentRequired: total,
    };
  }

  /**
   * Create tickets after payment is confirmed
   * Called by PaymentsService when payment succeeds
   */
  async createTicketsForPaidOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        tickets: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Already has tickets - don't create duplicates
    if (order.tickets.length > 0) {
      console.log(`⚠️ Order ${orderId} already has ${order.tickets.length} tickets`);
      return order.tickets;
    }

    const metadata = order.ticketMetadata as any;
    if (!metadata || !metadata.eventId || !metadata.tickets) {
      // Not a ticket order (might be shop order)
      console.log(`ℹ️ Order ${orderId} is not a ticket order`);
      return [];
    }

    const { eventId, tickets: ticketCreations } = metadata;

    // Verify event still exists and is valid
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTypes: true },
    });

    if (!event) {
      throw new NotFoundException('Event no longer exists');
    }

    // Create tickets and update sold counts in transaction
    const createdTickets = await this.prisma.$transaction(async (tx) => {
      const tickets = [];

      for (const item of ticketCreations) {
        // Verify availability one more time
        const ticketType = event.ticketTypes.find((tt) => tt.id === item.ticketTypeId);
        if (!ticketType) {
          throw new NotFoundException(`Ticket type ${item.ticketTypeId} not found`);
        }

        const available = ticketType.quantity - ticketType.sold;
        if (item.quantity > available) {
          throw new ConflictException(
            `Only ${available} tickets available for ${ticketType.name}. Order cannot be fulfilled.`,
          );
        }

        // Create tickets
        for (let i = 0; i < item.quantity; i++) {
          const qrCode = this.generateQrCode();
          const ticket = await tx.ticket.create({
            data: {
              qrCode,
              userId: order.userId,
              eventId,
              ticketTypeId: item.ticketTypeId,
              orderId: order.id,
            },
          });
          tickets.push(ticket);
        }

        // Update sold count
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { sold: { increment: item.quantity } },
        });
      }

      return tickets;
    });

    console.log(`✅ Created ${createdTickets.length} tickets for paid order ${order.orderNumber}`);

    // Send confirmation email if user has email
    if (order.user?.email) {
      const ticketUrl = `${this.frontendUrl}/tickets`;
      this.emailProvider.sendTicketConfirmation(
        order.user.email,
        order.user.name,
        event.title,
        createdTickets.length,
        order.total,
        ticketUrl,
      ).catch((error) => {
        console.error(`Failed to send ticket confirmation email:`, error);
      });
    }

    return createdTickets;
  }

  // Get user's tickets
  async getUserTickets(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            venue: true,
            date: true,
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

    return tickets;
  }

  // Get single ticket with QR code
  async getTicket(userId: string, ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        ticketType: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new NotFoundException('Ticket not found');
    }

    // Generate QR code image as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode, {
      width: 300,
      margin: 2,
    });

    return {
      ...ticket,
      qrCodeImage: qrCodeDataUrl,
    };
  }

  // Validate ticket at entry (organizer)
  async validateTicket(dto: ValidateTicketDto) {
    // Double-scan prevention: check if recently scanned
    if (this.isRecentlySscanned(dto.qrCode)) {
      return {
        valid: false,
        message: 'Ticket was just scanned. Please wait a moment.',
        isDoubleScan: true,
      };
    }

    // Record this scan attempt immediately
    this.recordScan(dto.qrCode);

    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode: dto.qrCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            organizerId: true,
          },
        },
        ticketType: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!ticket) {
      return {
        valid: false,
        message: 'Ticket not found',
      };
    }

    // Check if ticket is for today's event (or within a reasonable window)
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Allow check-in up to 24 hours before and 12 hours after event start
    if (hoursDiff > 24) {
      return {
        valid: false,
        message: 'Event has not started yet. Check-in opens 24 hours before.',
        eventDate: ticket.event.date,
      };
    }
    if (hoursDiff < -12) {
      return {
        valid: false,
        message: 'Event has ended. This ticket is no longer valid.',
        eventDate: ticket.event.date,
      };
    }

    if (ticket.status === 'USED') {
      return {
        valid: false,
        message: 'Ticket already used',
        usedAt: ticket.usedAt,
        ticket: {
          id: ticket.id,
          event: ticket.event.title,
          ticketType: ticket.ticketType.name,
          attendee: ticket.user.name || ticket.user.phone,
        },
      };
    }

    if (ticket.status === 'CANCELLED') {
      return {
        valid: false,
        message: 'Ticket has been cancelled',
      };
    }

    if (ticket.status === 'TRANSFERRED') {
      return {
        valid: false,
        message: 'Ticket has been transferred to another user',
      };
    }

    if (ticket.status === 'EXPIRED') {
      return {
        valid: false,
        message: 'Ticket has expired',
      };
    }

    // Use transaction with optimistic locking to prevent race conditions
    try {
      const updatedTicket = await this.prisma.ticket.update({
        where: {
          id: ticket.id,
          status: 'VALID', // Optimistic lock - only update if still VALID
        },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      });

      return {
        valid: true,
        message: 'Ticket validated successfully',
        ticket: {
          id: updatedTicket.id,
          event: ticket.event.title,
          ticketType: ticket.ticketType.name,
          attendee: ticket.user.name || ticket.user.phone,
        },
      };
    } catch (error) {
      // If update failed due to status change, ticket was used by another scanner
      return {
        valid: false,
        message: 'Ticket was just validated by another scanner',
        isRaceCondition: true,
      };
    }
  }

  // ============== TICKET TRANSFER METHODS ==============

  // Initiate a ticket transfer
  async initiateTransfer(userId: string, dto: InitiateTransferDto) {
    // Verify ticket ownership
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: dto.ticketId },
      include: {
        event: true,
        ticketType: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not own this ticket');
    }

    // Check ticket status
    if (ticket.status !== 'VALID') {
      throw new BadRequestException(
        `Cannot transfer ticket with status: ${ticket.status}`,
      );
    }

    // Check if event hasn't passed
    if (new Date(ticket.event.date) < new Date()) {
      throw new BadRequestException('Cannot transfer ticket for past event');
    }

    // Check if there's already a pending transfer for this ticket
    const existingTransfer = await this.prisma.ticketTransfer.findFirst({
      where: {
        ticketId: dto.ticketId,
        status: 'PENDING',
      },
    });

    if (existingTransfer) {
      throw new ConflictException(
        'This ticket already has a pending transfer. Cancel it first.',
      );
    }

    // Must provide either phone or email
    if (!dto.recipientPhone && !dto.recipientEmail) {
      throw new BadRequestException(
        'Please provide recipient phone or email',
      );
    }

    // Create transfer
    const transferCode = this.generateTransferCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TRANSFER_EXPIRY_HOURS);

    const transfer = await this.prisma.ticketTransfer.create({
      data: {
        ticketId: dto.ticketId,
        fromUserId: userId,
        recipientPhone: dto.recipientPhone,
        recipientEmail: dto.recipientEmail,
        message: dto.message,
        transferCode,
        expiresAt,
      },
    });

    // Get sender name for personalized message
    const sender = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Send SMS notification to recipient if phone provided
    if (dto.recipientPhone) {
      try {
        await this.smsProvider.sendTransferNotification(
          dto.recipientPhone,
          ticket.event.title,
          transferCode,
          sender?.name || undefined,
          TRANSFER_EXPIRY_HOURS,
        );
        console.log(`✅ Transfer SMS sent to ${dto.recipientPhone}`);
      } catch (error) {
        console.error('Failed to send transfer SMS:', error);
        // Don't fail the transfer if SMS fails
      }
    }

    // Send email notification if recipientEmail provided
    if (dto.recipientEmail) {
      const claimUrl = `${this.frontendUrl}/tickets/claim?code=${transferCode}`;
      this.emailProvider.sendTicketTransferNotification(
        dto.recipientEmail,
        sender?.name || null,
        ticket.event.title,
        transferCode,
        claimUrl,
      ).catch((error) => {
        console.error('Failed to send transfer email:', error);
        // Don't fail the transfer if email fails
      });
    }

    return {
      transfer: {
        id: transfer.id,
        transferCode: transfer.transferCode,
        expiresAt: transfer.expiresAt,
        recipientPhone: transfer.recipientPhone,
        recipientEmail: transfer.recipientEmail,
      },
      ticket: {
        id: ticket.id,
        event: ticket.event.title,
        ticketType: ticket.ticketType.name,
      },
      message: dto.recipientPhone
        ? `Transfer code ${transferCode} has been sent to ${dto.recipientPhone}. Valid for ${TRANSFER_EXPIRY_HOURS} hours.`
        : `Share code ${transferCode} with the recipient. Valid for ${TRANSFER_EXPIRY_HOURS} hours.`,
    };
  }

  // Claim a transferred ticket
  async claimTransfer(userId: string, dto: ClaimTransferDto) {
    const transfer = await this.prisma.ticketTransfer.findUnique({
      where: { transferCode: dto.transferCode.toUpperCase() },
      include: {
        ticket: {
          include: {
            event: true,
            ticketType: true,
          },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Invalid transfer code');
    }

    // Check status
    if (transfer.status === 'CLAIMED') {
      throw new BadRequestException('This transfer has already been claimed');
    }
    if (transfer.status === 'CANCELLED') {
      throw new BadRequestException('This transfer has been cancelled');
    }
    if (transfer.status === 'EXPIRED' || transfer.expiresAt < new Date()) {
      throw new BadRequestException('This transfer has expired');
    }

    // Can't claim your own ticket
    if (transfer.fromUserId === userId) {
      throw new BadRequestException('You cannot claim your own transfer');
    }

    // Get the ticket
    const ticket = transfer.ticket;
    if (!ticket) {
      throw new NotFoundException('Ticket no longer exists');
    }

    // Perform the transfer in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Generate new QR code for the new owner
      const newQrCode = this.generateQrCode();

      // Update ticket ownership
      const updatedTicket = await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          userId,
          qrCode: newQrCode,
          status: 'VALID',
        },
        include: {
          event: true,
          ticketType: true,
        },
      });

      // Mark transfer as claimed
      await tx.ticketTransfer.update({
        where: { id: transfer.id },
        data: {
          status: 'CLAIMED',
          toUserId: userId,
          claimedAt: new Date(),
        },
      });

      return updatedTicket;
    });

    // Generate new QR code image
    const qrCodeDataUrl = await QRCode.toDataURL(result.qrCode, {
      width: 300,
      margin: 2,
    });

    return {
      success: true,
      message: 'Ticket claimed successfully',
      ticket: {
        id: result.id,
        qrCode: result.qrCode,
        qrCodeImage: qrCodeDataUrl,
        event: result.event.title,
        eventDate: result.event.date,
        venue: result.event.venue,
        ticketType: result.ticketType.name,
      },
    };
  }

  // Cancel a pending transfer
  async cancelTransfer(userId: string, dto: CancelTransferDto) {
    const transfer = await this.prisma.ticketTransfer.findUnique({
      where: { id: dto.transferId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.fromUserId !== userId) {
      throw new ForbiddenException('You cannot cancel this transfer');
    }

    if (transfer.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot cancel transfer with status: ${transfer.status}`,
      );
    }

    await this.prisma.ticketTransfer.update({
      where: { id: dto.transferId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Transfer cancelled successfully' };
  }

  // Get pending transfers for a user (outgoing)
  async getPendingTransfers(userId: string) {
    const transfers = await this.prisma.ticketTransfer.findMany({
      where: {
        fromUserId: userId,
        status: 'PENDING',
      },
      include: {
        ticket: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                date: true,
                venue: true,
              },
            },
            ticketType: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transfers.map((t) => ({
      id: t.id,
      transferCode: t.transferCode,
      recipientPhone: t.recipientPhone,
      recipientEmail: t.recipientEmail,
      expiresAt: t.expiresAt,
      createdAt: t.createdAt,
      ticket: {
        id: t.ticket?.id,
        event: t.ticket?.event?.title,
        eventDate: t.ticket?.event?.date,
        venue: t.ticket?.event?.venue,
        ticketType: t.ticket?.ticketType?.name,
      },
    }));
  }

  // Get transfer history for a user
  async getTransferHistory(userId: string) {
    const transfers = await this.prisma.ticketTransfer.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        ticket: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transfers.map((t) => ({
      id: t.id,
      direction: t.fromUserId === userId ? 'sent' : 'received',
      status: t.status,
      eventTitle: t.ticket?.event?.title,
      createdAt: t.createdAt,
      claimedAt: t.claimedAt,
    }));
  }

  // ============== WHATSAPP SHARING ==============

  // Get WhatsApp share link for a ticket
  async getTicketWhatsAppShareLink(userId: string, ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
          },
        },
        ticketType: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not own this ticket');
    }

    const shareLink = this.whatsAppProvider.generateTicketShareLink(
      ticket.event.title,
      ticket.event.date,
      ticket.ticketType.name,
    );

    return {
      ticketId: ticket.id,
      eventTitle: ticket.event.title,
      whatsappUrl: shareLink.url,
      shareMessage: shareLink.message,
    };
  }

  // Get WhatsApp link to send ticket details to someone
  async getTicketWhatsAppSendLink(
    userId: string,
    ticketId: string,
    recipientPhone: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            title: true,
            date: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not own this ticket');
    }

    const sendLink = this.whatsAppProvider.generateTicketSendLink(
      recipientPhone,
      ticket.event.title,
      ticket.event.date,
      ticket.qrCode,
    );

    return {
      ticketId: ticket.id,
      whatsappUrl: sendLink.url,
      message: sendLink.message,
    };
  }
}
