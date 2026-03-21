import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get event branding (public)
   */
  async getBranding(eventId: string) {
    const branding = await this.prisma.eventBranding.findUnique({
      where: { eventId },
    });

    if (!branding) throw new NotFoundException('Branding not found for this event');

    return branding;
  }

  /**
   * Create or update event branding (ORGANIZER only)
   */
  async upsertBranding(
    userId: string,
    eventId: string,
    data: {
      primaryColor?: string;
      secondaryColor?: string;
      logoUrl?: string;
      bannerUrl?: string;
      fontFamily?: string;
      customCss?: string;
    },
  ) {
    // Verify the event belongs to this organizer
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer?.userId !== userId) {
      throw new BadRequestException('You are not the organizer of this event');
    }

    return this.prisma.eventBranding.upsert({
      where: { eventId },
      create: {
        eventId,
        organizerId: event.organizer!.id,
        ...data,
      },
      update: data,
    });
  }

  /**
   * Remove event branding (ORGANIZER only)
   */
  async removeBranding(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer?.userId !== userId) {
      throw new BadRequestException('You are not the organizer of this event');
    }

    const branding = await this.prisma.eventBranding.findUnique({
      where: { eventId },
    });
    if (!branding) throw new NotFoundException('Branding not found for this event');

    return this.prisma.eventBranding.delete({ where: { eventId } });
  }
}
