import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  /**
   * List all active venues
   */
  async findAll() {
    return this.prisma.venue.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get venue details by ID
   */
  async findOne(id: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  /**
   * Create a new venue (ADMIN only)
   */
  async create(data: {
    name: string;
    address: string;
    city?: string;
    capacity?: number;
    description?: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
  }) {
    return this.prisma.venue.create({ data });
  }

  /**
   * Update a venue (ADMIN only)
   */
  async update(
    id: string,
    data: {
      name?: string;
      address?: string;
      city?: string;
      capacity?: number;
      description?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');

    return this.prisma.venue.update({ where: { id }, data });
  }

  /**
   * Soft-delete a venue (ADMIN only)
   */
  async remove(id: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');

    return this.prisma.venue.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
