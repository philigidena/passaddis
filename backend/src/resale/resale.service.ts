import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_RESALE_MARKUP = 1.5; // 150% of original price

@Injectable()
export class ResaleService {
  constructor(private prisma: PrismaService) {}

  /**
   * List a ticket for resale
   */
  async listForResale(userId: string, ticketId: string, askingPrice: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { ticketType: true, event: { select: { id: true, title: true, date: true } } },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.userId !== userId) throw new BadRequestException('Not your ticket');
    if (ticket.status !== 'VALID') throw new BadRequestException('Ticket is not valid for resale');

    // Event must be in the future
    if (ticket.event.date < new Date()) {
      throw new BadRequestException('Cannot resale tickets for past events');
    }

    // Price cap: max 150% of original
    const maxPrice = ticket.ticketType.price * MAX_RESALE_MARKUP;
    if (askingPrice > maxPrice) {
      throw new BadRequestException(`Maximum resale price is ${maxPrice.toFixed(0)} ETB (150% of original)`);
    }

    if (askingPrice < 1) {
      throw new BadRequestException('Minimum resale price is 1 ETB');
    }

    // Check no existing listing
    const existing = await this.prisma.ticketResale.findUnique({
      where: { ticketId },
    });
    if (existing && existing.status === 'LISTED') {
      throw new BadRequestException('Ticket is already listed for resale');
    }

    return this.prisma.ticketResale.create({
      data: {
        ticketId,
        eventId: ticket.eventId,
        sellerId: userId,
        askingPrice,
        originalPrice: ticket.ticketType.price,
      },
    });
  }

  /**
   * Cancel a resale listing
   */
  async cancelListing(userId: string, resaleId: string) {
    const listing = await this.prisma.ticketResale.findUnique({
      where: { id: resaleId },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId !== userId) throw new BadRequestException('Not your listing');
    if (listing.status !== 'LISTED') throw new BadRequestException('Listing is not active');

    return this.prisma.ticketResale.update({
      where: { id: resaleId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  /**
   * Get resale listings for an event
   */
  async getEventListings(eventId: string) {
    return this.prisma.ticketResale.findMany({
      where: { eventId, status: 'LISTED' },
      include: {
        ticket: {
          include: {
            ticketType: { select: { name: true, price: true } },
          },
        },
      },
      orderBy: { askingPrice: 'asc' },
    });
  }

  /**
   * Get user's resale listings
   */
  async getMyListings(userId: string) {
    return this.prisma.ticketResale.findMany({
      where: { sellerId: userId },
      include: {
        ticket: {
          include: {
            ticketType: { select: { name: true } },
            event: { select: { id: true, title: true, date: true, imageUrl: true } },
          },
        },
      },
      orderBy: { listedAt: 'desc' },
    });
  }

  /**
   * Purchase a resale ticket
   * In production this would integrate with payment flow
   */
  async purchaseResale(buyerId: string, resaleId: string) {
    const listing = await this.prisma.ticketResale.findUnique({
      where: { id: resaleId },
      include: { ticket: true },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== 'LISTED') throw new BadRequestException('Listing no longer available');
    if (listing.sellerId === buyerId) throw new BadRequestException('Cannot buy your own listing');

    const platformFee = listing.askingPrice * 0.1; // 10% platform commission on resale

    await this.prisma.$transaction([
      // Update resale listing
      this.prisma.ticketResale.update({
        where: { id: resaleId },
        data: {
          status: 'SOLD',
          buyerId,
          soldAt: new Date(),
          platformFee,
        },
      }),
      // Transfer ticket ownership
      this.prisma.ticket.update({
        where: { id: listing.ticketId },
        data: { userId: buyerId },
      }),
    ]);

    return {
      success: true,
      message: 'Ticket purchased successfully',
      ticketId: listing.ticketId,
      price: listing.askingPrice,
      platformFee,
    };
  }
}
