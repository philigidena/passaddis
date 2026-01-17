import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AfroSmsProvider } from '../auth/providers/afro-sms.provider';
import {
  CreateShopOwnerProfileDto,
  UpdateShopOwnerProfileDto,
  CreateShopItemDto,
  UpdateShopItemDto,
  ShopItemQueryDto,
  UpdateStockDto,
  BulkUpdateCuratedDto,
  ReorderCuratedItemsDto,
} from './dto/shop-owner.dto';

@Injectable()
export class ShopOwnerService {
  constructor(
    private prisma: PrismaService,
    private smsProvider: AfroSmsProvider,
  ) {}

  // ==================== HELPER: VERIFY MERCHANT STATUS ====================

  private async getVerifiedMerchant(userId: string, requireActive = false) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Shop owner profile not found. Please create one first.');
    }

    if (requireActive) {
      if (merchant.status === 'PENDING') {
        throw new ForbiddenException(
          'Your shop owner account is pending approval. Please wait for admin verification.',
        );
      }

      if (merchant.status === 'SUSPENDED') {
        throw new ForbiddenException(
          'Your shop owner account has been suspended. Please contact support for assistance.',
        );
      }

      if (merchant.status === 'BLOCKED') {
        throw new ForbiddenException(
          'Your shop owner account has been blocked. Please contact support for assistance.',
        );
      }

      if (merchant.status !== 'ACTIVE') {
        throw new ForbiddenException(
          `Your shop owner account is not active. Current status: ${merchant.status}`,
        );
      }
    }

    return merchant;
  }

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

    return merchant;
  }

  async createProfile(userId: string, dto: CreateShopOwnerProfileDto) {
    // Check if user already has a profile
    const existing = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Shop owner profile already exists');
    }

    // Generate unique merchant code
    const count = await this.prisma.merchant.count();
    const merchantCode = `PS${String(count + 1).padStart(4, '0')}`;

    // Create merchant profile
    const merchant = await this.prisma.merchant.create({
      data: {
        merchantCode,
        businessName: dto.businessName,
        tradeName: dto.tradeName,
        description: dto.description,
        logo: dto.logo,
        type: 'SHOP',
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

    // Update user role to SHOP_OWNER
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'SHOP_OWNER' },
    });

    return merchant;
  }

  async updateProfile(userId: string, dto: UpdateShopOwnerProfileDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant) {
      throw new NotFoundException('Shop owner profile not found');
    }

    return this.prisma.merchant.update({
      where: { userId },
      data: dto,
    });
  }

  // ==================== DASHBOARD ====================

  async getDashboard(userId: string) {
    // Don't require active status for viewing dashboard (so pending users can see their status)
    const merchant = await this.getVerifiedMerchant(userId, false);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Get order stats - using direct merchantId relationship
    const orderStats = await this.prisma.order.groupBy({
      by: ['status'],
      where: {
        merchantId: merchant.id,
      },
      _count: true,
    });

    // Get revenue stats - using direct merchantId relationship
    const totalRevenue = await this.prisma.order.aggregate({
      where: {
        merchantId: merchant.id,
        status: { in: ['PAID', 'COMPLETED', 'READY_FOR_PICKUP'] },
      },
      _sum: { total: true },
    });

    const monthlyRevenue = await this.prisma.order.aggregate({
      where: {
        merchantId: merchant.id,
        status: { in: ['PAID', 'COMPLETED', 'READY_FOR_PICKUP'] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    });

    const weeklyRevenue = await this.prisma.order.aggregate({
      where: {
        merchantId: merchant.id,
        status: { in: ['PAID', 'COMPLETED', 'READY_FOR_PICKUP'] },
        createdAt: { gte: startOfWeek },
      },
      _sum: { total: true },
    });

    // Get top selling items
    const topItems = await this.prisma.orderItem.groupBy({
      by: ['shopItemId'],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Get item details
    const itemIds = topItems.map((i) => i.shopItemId);
    const items = await this.prisma.shopItem.findMany({
      where: { id: { in: itemIds } },
    });

    const topItemsWithDetails = topItems.map((ti) => {
      const item = items.find((i) => i.id === ti.shopItemId);
      return {
        id: ti.shopItemId,
        name: item?.name || 'Unknown',
        soldCount: ti._sum.quantity || 0,
        revenue: (ti._sum.price || 0) * (ti._sum.quantity || 0),
      };
    });

    // Wallet info
    const walletBalance = await this.prisma.walletTransaction.aggregate({
      where: { merchantId: merchant.id },
      _sum: { netAmount: true },
    });

    // Build response
    const statusCounts = orderStats.reduce(
      (acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      },
      {
        pending: 0,
        paid: 0,
        ready_for_pickup: 0,
        completed: 0,
        cancelled: 0,
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
      orders: {
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        pending: statusCounts.pending + statusCounts.paid,
        ready: statusCounts.ready_for_pickup,
        completed: statusCounts.completed,
        cancelled: statusCounts.cancelled,
      },
      revenue: {
        total: totalRevenue._sum.total || 0,
        thisMonth: monthlyRevenue._sum.total || 0,
        thisWeek: weeklyRevenue._sum.total || 0,
      },
      wallet: {
        balance: walletBalance._sum.netAmount || 0,
        pendingSettlement: 0, // Would need to calculate unsettled orders
      },
      topItems: topItemsWithDetails,
    };
  }

  // ==================== ORDER MANAGEMENT ====================

  async getOrders(userId: string, status?: string) {
    // Require active status to view orders
    const merchant = await this.getVerifiedMerchant(userId, true);

    const where: any = {
      // Use direct merchantId relationship
      merchantId: merchant.id,
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            shopItem: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
              },
            },
          },
        },
        pickupLocation: {
          select: {
            id: true,
            name: true,
            area: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(userId: string, orderId: string) {
    // Require active status to view order details
    await this.getVerifiedMerchant(userId, true);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            shopItem: true,
          },
        },
        pickupLocation: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    userId: string,
    orderId: string,
    status: 'READY_FOR_PICKUP' | 'COMPLETED',
  ) {
    // Require active merchant to update order status
    const merchant = await this.getVerifiedMerchant(userId, true);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { phone: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PAID: ['READY_FOR_PICKUP'],
      READY_FOR_PICKUP: ['COMPLETED'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Cannot change order status from ${order.status} to ${status}`,
      );
    }

    const updateData: any = { status };

    if (status === 'COMPLETED') {
      updateData.pickedUpAt = new Date();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: { name: true, phone: true },
        },
        items: {
          include: {
            shopItem: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Send SMS notification when order is ready for pickup
    if (status === 'READY_FOR_PICKUP' && order.user?.phone) {
      try {
        await this.smsProvider.sendOrderReadyNotification(
          order.user.phone,
          order.orderNumber,
          merchant.businessName,
        );
        console.log(`✅ Order ready SMS sent to ${order.user.phone}`);
      } catch (error) {
        console.error('Failed to send order ready SMS:', error);
        // Don't fail the status update if SMS fails
      }
    }

    return updatedOrder;
  }

  // ==================== VALIDATE PICKUP ====================

  async validatePickup(userId: string, qrCode: string) {
    // Require active merchant to validate pickups
    await this.getVerifiedMerchant(userId, true);

    const order = await this.prisma.order.findUnique({
      where: { qrCode },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            shopItem: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return {
        valid: false,
        message: 'Order not found',
      };
    }

    if (order.status === 'COMPLETED') {
      return {
        valid: false,
        message: 'Order already picked up',
        pickedUpAt: order.pickedUpAt,
      };
    }

    if (order.status === 'CANCELLED') {
      return {
        valid: false,
        message: 'Order has been cancelled',
      };
    }

    if (order.status !== 'READY_FOR_PICKUP' && order.status !== 'PAID') {
      return {
        valid: false,
        message: `Order is not ready for pickup. Status: ${order.status}`,
      };
    }

    // Mark as completed
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        pickedUpAt: new Date(),
      },
    });

    return {
      valid: true,
      message: 'Order validated successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user.name || order.user.phone,
        items: order.items.map((i) => ({
          name: i.shopItem.name,
          quantity: i.quantity,
        })),
        total: order.total,
      },
    };
  }

  // ==================== ANALYTICS ====================

  async getSalesAnalytics(userId: string, period: 'week' | 'month' | 'year') {
    // Require active status to view analytics
    await this.getVerifiedMerchant(userId, true);

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Get orders in period
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['PAID', 'COMPLETED', 'READY_FOR_PICKUP'] },
        items: { some: {} },
      },
      include: {
        items: true,
      },
    });

    // Calculate daily/weekly/monthly breakdown
    const salesByDay: Record<string, { orders: number; revenue: number }> = {};

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!salesByDay[dateKey]) {
        salesByDay[dateKey] = { orders: 0, revenue: 0 };
      }
      salesByDay[dateKey].orders += 1;
      salesByDay[dateKey].revenue += order.total;
    });

    return {
      period,
      startDate,
      endDate: now,
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        avgOrderValue:
          orders.length > 0
            ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length
            : 0,
      },
      dailyBreakdown: Object.entries(salesByDay).map(([date, data]) => ({
        date,
        ...data,
      })),
    };
  }

  // ==================== SHOP ITEM MANAGEMENT ====================

  async getShopItems(userId: string, query: ShopItemQueryDto) {
    // Don't require active status for viewing items (so pending users can view their items)
    const merchant = await this.getVerifiedMerchant(userId, false);

    const where: any = {
      merchantId: merchant.id,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.curatedOnly) {
      where.isCurated = true;
    }

    if (query.inStockOnly) {
      where.inStock = true;
    }

    if (query.eventId) {
      where.eventId = query.eventId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.shopItem.findMany({
      where,
      orderBy: [
        { isCurated: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async getShopItem(userId: string, itemId: string) {
    // Don't require active status for viewing item details
    const merchant = await this.getVerifiedMerchant(userId, false);

    const item = await this.prisma.shopItem.findUnique({
      where: { id: itemId },
      include: {
        event: true,
        orderItems: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            order: {
              select: {
                orderNumber: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Shop item not found');
    }

    if (item.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this item');
    }

    return item;
  }

  async createShopItem(userId: string, dto: CreateShopItemDto) {
    // Require active merchant to create items
    const merchant = await this.getVerifiedMerchant(userId, true);

    // Check for duplicate SKU if provided
    if (dto.sku) {
      const existingSku = await this.prisma.shopItem.findUnique({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Auto-calculate inStock based on stockQuantity
    const inStock = dto.stockQuantity ? dto.stockQuantity > 0 : true;

    return this.prisma.shopItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        category: dto.category as any,
        stockQuantity: dto.stockQuantity || 0,
        lowStockThreshold: dto.lowStockThreshold || 10,
        sku: dto.sku,
        isCurated: dto.isCurated || false,
        isFeatured: dto.isFeatured || false,
        displayOrder: dto.displayOrder || 0,
        badge: dto.badge,
        eventId: dto.eventId,
        merchantId: merchant.id,
        inStock,
      },
    });
  }

  async updateShopItem(userId: string, itemId: string, dto: UpdateShopItemDto) {
    // Require active merchant to update items
    const merchant = await this.getVerifiedMerchant(userId, true);

    const item = await this.prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Shop item not found');
    }

    if (item.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this item');
    }

    // Check for duplicate SKU if changing
    if (dto.sku && dto.sku !== item.sku) {
      const existingSku = await this.prisma.shopItem.findUnique({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Auto-update inStock if stockQuantity is provided
    const updateData: any = { ...dto };
    if (dto.stockQuantity !== undefined) {
      updateData.inStock = dto.stockQuantity > 0;
    }

    return this.prisma.shopItem.update({
      where: { id: itemId },
      data: updateData,
    });
  }

  async deleteShopItem(userId: string, itemId: string) {
    // Require active merchant to delete items
    const merchant = await this.getVerifiedMerchant(userId, true);

    const item = await this.prisma.shopItem.findUnique({
      where: { id: itemId },
      include: {
        orderItems: { take: 1 },
      },
    });

    if (!item) {
      throw new NotFoundException('Shop item not found');
    }

    if (item.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this item');
    }

    // Don't delete items that have been ordered
    if (item.orderItems.length > 0) {
      // Instead of deleting, mark as out of stock
      return this.prisma.shopItem.update({
        where: { id: itemId },
        data: {
          inStock: false,
          stockQuantity: 0,
        },
      });
    }

    return this.prisma.shopItem.delete({
      where: { id: itemId },
    });
  }

  // ==================== CURATED ITEMS MANAGEMENT ====================

  async getCuratedItems(userId: string) {
    // Don't require active status for viewing curated items
    const merchant = await this.getVerifiedMerchant(userId, false);

    return this.prisma.shopItem.findMany({
      where: {
        merchantId: merchant.id,
        isCurated: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async updateCuratedStatus(userId: string, dto: BulkUpdateCuratedDto) {
    // Require active merchant to manage curated items
    const merchant = await this.getVerifiedMerchant(userId, true);

    // Verify all items belong to this merchant
    const items = await this.prisma.shopItem.findMany({
      where: {
        id: { in: dto.itemIds },
        merchantId: merchant.id,
      },
    });

    if (items.length !== dto.itemIds.length) {
      throw new ForbiddenException('Some items do not belong to you');
    }

    await this.prisma.shopItem.updateMany({
      where: {
        id: { in: dto.itemIds },
        merchantId: merchant.id,
      },
      data: {
        isCurated: dto.isCurated,
      },
    });

    return { updated: dto.itemIds.length };
  }

  async reorderCuratedItems(userId: string, dto: ReorderCuratedItemsDto) {
    // Require active merchant to reorder items
    const merchant = await this.getVerifiedMerchant(userId, true);

    // Update display order for each item
    const updates = dto.items.map((item) =>
      this.prisma.shopItem.updateMany({
        where: {
          id: item.id,
          merchantId: merchant.id,
        },
        data: {
          displayOrder: item.displayOrder,
        },
      }),
    );

    await Promise.all(updates);

    return { reordered: dto.items.length };
  }

  // ==================== STOCK MANAGEMENT ====================

  async updateStock(userId: string, itemId: string, dto: UpdateStockDto) {
    // Require active merchant to update stock
    const merchant = await this.getVerifiedMerchant(userId, true);

    const item = await this.prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Shop item not found');
    }

    if (item.merchantId !== merchant.id) {
      throw new ForbiddenException('You do not own this item');
    }

    return this.prisma.shopItem.update({
      where: { id: itemId },
      data: {
        stockQuantity: dto.stockQuantity,
        inStock: dto.stockQuantity > 0,
      },
    });
  }

  async getLowStockItems(userId: string) {
    // Don't require active status for viewing low stock items
    const merchant = await this.getVerifiedMerchant(userId, false);

    // Get items where stockQuantity <= lowStockThreshold
    return this.prisma.$queryRaw`
      SELECT * FROM shop_items
      WHERE merchant_id = ${merchant.id}
        AND stock_quantity <= low_stock_threshold
        AND in_stock = true
      ORDER BY stock_quantity ASC
    `;
  }

  // ==================== ORDER CANCELLATION ====================

  async cancelOrder(userId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not own this order');
    }

    // Can only cancel pending or paid orders (not picked up or completed)
    if (!['PENDING', 'PAID'].includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    const updateData: any = {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelledBy: 'user',
      cancellationReason: reason,
    };

    // If order was paid, initiate refund
    if (order.status === 'PAID' && order.payment) {
      updateData.refundStatus = 'PENDING';
      updateData.refundAmount = order.total;
    }

    // Restore stock for cancelled items
    for (const item of order.items) {
      await this.prisma.shopItem.update({
        where: { id: item.shopItemId },
        data: {
          stockQuantity: { increment: item.quantity },
          inStock: true,
        },
      });
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            shopItem: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
