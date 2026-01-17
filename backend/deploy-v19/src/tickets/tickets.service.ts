import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseTicketsDto, ValidateTicketDto } from './dto/tickets.dto';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

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

    // Create order and tickets in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Generate order number
      const orderNumber = `PA${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          serviceFee,
          total,
          status: 'PENDING',
        },
      });

      // Create tickets and update sold counts
      const createdTickets = [];
      for (const item of ticketCreations) {
        for (let i = 0; i < item.quantity; i++) {
          const qrCode = this.generateQrCode();
          const ticket = await tx.ticket.create({
            data: {
              qrCode,
              userId,
              eventId,
              ticketTypeId: item.ticketTypeId,
              orderId: order.id,
            },
          });
          createdTickets.push(ticket);
        }

        // Update sold count
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { sold: { increment: item.quantity } },
        });
      }

      return { order, tickets: createdTickets };
    });

    return {
      order: result.order,
      tickets: result.tickets,
      paymentRequired: total,
    };
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
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode: dto.qrCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
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

    if (ticket.status === 'USED') {
      return {
        valid: false,
        message: 'Ticket already used',
        usedAt: ticket.usedAt,
      };
    }

    if (ticket.status === 'CANCELLED') {
      return {
        valid: false,
        message: 'Ticket has been cancelled',
      };
    }

    // Mark ticket as used
    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
    });

    return {
      valid: true,
      message: 'Ticket validated successfully',
      ticket: {
        id: ticket.id,
        event: ticket.event.title,
        ticketType: ticket.ticketType.name,
        attendee: ticket.user.name || ticket.user.phone,
      },
    };
  }
}
