import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateUserRoleDto,
  UserQueryDto,
  ApproveEventDto,
  RejectEventDto,
  EventQueryDto,
  VerifyOrganizerDto,
  OrganizerQueryDto,
  CreateShopItemDto,
  UpdateShopItemDto,
  CreatePickupLocationDto,
  UpdatePickupLocationDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ==================== DASHBOARD ====================

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersThisMonth,
      usersByRole,
      totalEvents,
      pendingEvents,
      publishedEvents,
      eventsThisMonth,
      ticketStats,
      orderStats,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count(),

      // New users this month
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Users by role
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // Total events
      this.prisma.event.count(),

      // Pending events
      this.prisma.event.count({ where: { status: 'PENDING' } }),

      // Published events
      this.prisma.event.count({ where: { status: 'PUBLISHED' } }),

      // Events this month
      this.prisma.event.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Ticket stats
      this.prisma.ticket.aggregate({
        _count: true,
      }),

      // Order stats
      this.prisma.order.aggregate({
        _count: true,
        _sum: { total: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    // Calculate ticket revenue
    const ticketRevenue = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        tickets: { some: {} },
      },
    });

    // Monthly ticket stats
    const monthlyTickets = await this.prisma.ticket.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const monthlyRevenue = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        byRole: usersByRole.reduce(
          (acc, item) => {
            acc[item.role] = item._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      events: {
        total: totalEvents,
        pending: pendingEvents,
        published: publishedEvents,
        thisMonth: eventsThisMonth,
      },
      tickets: {
        totalSold: ticketStats._count,
        revenue: ticketRevenue._sum.total || 0,
        thisMonth: {
          sold: monthlyTickets,
          revenue: monthlyRevenue._sum.total || 0,
        },
      },
      orders: {
        total: orderStats._count,
        pending: await this.prisma.order.count({ where: { status: 'PENDING' } }),
        completed: orderStats._count,
        revenue: orderStats._sum.total || 0,
      },
    };
  }

  // ==================== USER MANAGEMENT ====================

  async getUsers(query: UserQueryDto) {
    const { search, role, page = 1, limit = 20 } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              tickets: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organizer: true,
        merchant: true,
        _count: {
          select: {
            tickets: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (id === adminId) {
      throw new BadRequestException('Cannot change your own role');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role as any },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  // ==================== EVENT APPROVAL ====================

  async getPendingEvents(query: EventQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      // Default to showing pending events
      where.status = 'PENDING';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              businessName: true,
              isVerified: true,
            },
          },
          ticketTypes: {
            select: {
              name: true,
              price: true,
              quantity: true,
            },
          },
          _count: {
            select: {
              tickets: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveEvent(eventId: string, adminId: string, dto: ApproveEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PENDING') {
      throw new BadRequestException('Only pending events can be approved');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminId,
        isFeatured: dto.featured || false,
        rejectionReason: null,
      },
      include: {
        organizer: {
          select: { businessName: true },
        },
        ticketTypes: true,
      },
    });
  }

  async rejectEvent(eventId: string, adminId: string, dto: RejectEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PENDING') {
      throw new BadRequestException('Only pending events can be rejected');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'REJECTED',
        rejectionReason: dto.reason,
        approvedBy: adminId,
      },
      include: {
        organizer: {
          select: { businessName: true },
        },
      },
    });
  }

  async toggleEventFeatured(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: { isFeatured: !event.isFeatured },
    });
  }

  // ==================== ORGANIZER MANAGEMENT ====================

  async getOrganizers(query: OrganizerQueryDto) {
    const { status, verified, search, page = 1, limit = 20 } = query;

    // Query from Merchant model (new) or Organizer (legacy)
    const where: any = {
      type: 'ORGANIZER',
    };

    if (status) {
      where.status = status;
    }

    if (verified !== undefined) {
      where.isVerified = verified;
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { tradeName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [merchants, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              events: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.merchant.count({ where }),
    ]);

    return {
      data: merchants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifyOrganizer(merchantId: string, adminId: string, dto: VerifyOrganizerDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer not found');
    }

    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId,
        status: 'ACTIVE',
        commissionRate: dto.commissionRate || merchant.commissionRate,
      },
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });
  }

  async suspendOrganizer(merchantId: string, reason: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Organizer not found');
    }

    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        status: 'SUSPENDED',
      },
    });
  }

  // ==================== SHOP ITEM MANAGEMENT ====================

  async getShopItems() {
    return this.prisma.shopItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });
  }

  async createShopItem(dto: CreateShopItemDto) {
    return this.prisma.shopItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        category: dto.category as any,
        inStock: dto.inStock ?? true,
      },
    });
  }

  async updateShopItem(id: string, dto: UpdateShopItemDto) {
    const item = await this.prisma.shopItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Shop item not found');
    }

    return this.prisma.shopItem.update({
      where: { id },
      data: {
        ...dto,
        category: dto.category as any,
      },
    });
  }

  async deleteShopItem(id: string) {
    const item = await this.prisma.shopItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Shop item not found');
    }

    // Check if item has orders
    const orderCount = await this.prisma.orderItem.count({
      where: { shopItemId: id },
    });

    if (orderCount > 0) {
      // Soft delete by setting inStock to false
      return this.prisma.shopItem.update({
        where: { id },
        data: { inStock: false },
      });
    }

    return this.prisma.shopItem.delete({ where: { id } });
  }

  // ==================== PICKUP LOCATION MANAGEMENT ====================

  async getPickupLocations() {
    return this.prisma.pickupLocation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });
  }

  async createPickupLocation(dto: CreatePickupLocationDto) {
    return this.prisma.pickupLocation.create({
      data: {
        name: dto.name,
        area: dto.area,
        address: dto.address,
        hours: dto.hours,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updatePickupLocation(id: string, dto: UpdatePickupLocationDto) {
    const location = await this.prisma.pickupLocation.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Pickup location not found');
    }

    return this.prisma.pickupLocation.update({
      where: { id },
      data: dto,
    });
  }

  async deletePickupLocation(id: string) {
    const location = await this.prisma.pickupLocation.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Pickup location not found');
    }

    // Check if location has orders
    const orderCount = await this.prisma.order.count({
      where: { pickupLocationId: id },
    });

    if (orderCount > 0) {
      // Soft delete by setting isActive to false
      return this.prisma.pickupLocation.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.pickupLocation.delete({ where: { id } });
  }

  // ==================== ALL EVENTS (FOR ADMIN VIEW) ====================

  async getAllEvents(query: EventQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              businessName: true,
              isVerified: true,
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
          _count: {
            select: {
              tickets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    // Add revenue calculation
    const eventsWithStats = events.map((event) => ({
      ...event,
      ticketsSold: event._count.tickets,
      revenue: event.ticketTypes.reduce(
        (sum, tt) => sum + tt.price * tt.sold,
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
}
