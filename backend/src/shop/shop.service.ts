import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ShopItemQueryDto,
  CreateShopOrderDto,
  ValidatePickupDto,
} from './dto/shop.dto';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  // Get all shop items (only from active merchants)
  async getItems(query: ShopItemQueryDto) {
    const where: any = {
      inStock: true,
      // Only show items from active merchants or items without a merchant (admin-created)
      OR: [
        { merchantId: null },
        {
          merchant: {
            status: 'ACTIVE',
          },
        },
      ],
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    return this.prisma.shopItem.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { isCurated: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        inStock: true,
        stockQuantity: true,
        isCurated: true,
        isFeatured: true,
        badge: true,
        eventId: true,
        merchantId: true,
      },
    });
  }

  // Get curated items (featured selection, only from active merchants)
  async getCuratedItems() {
    return this.prisma.shopItem.findMany({
      where: {
        inStock: true,
        isCurated: true,
        OR: [
          { merchantId: null },
          { merchant: { status: 'ACTIVE' } },
        ],
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        inStock: true,
        badge: true,
        merchantId: true,
      },
    });
  }

  // Get featured items (only from active merchants)
  async getFeaturedItems() {
    return this.prisma.shopItem.findMany({
      where: {
        inStock: true,
        isFeatured: true,
        OR: [
          { merchantId: null },
          { merchant: { status: 'ACTIVE' } },
        ],
      },
      orderBy: { displayOrder: 'asc' },
      take: 6,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        badge: true,
        merchantId: true,
      },
    });
  }

  // Get event-specific items (only from active merchants)
  async getEventItems(eventId: string) {
    return this.prisma.shopItem.findMany({
      where: {
        inStock: true,
        eventId,
        OR: [
          { merchantId: null },
          { merchant: { status: 'ACTIVE' } },
        ],
      },
      orderBy: [
        { isCurated: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        inStock: true,
        badge: true,
        merchantId: true,
      },
    });
  }

  // Get pickup locations
  async getPickupLocations() {
    return this.prisma.pickupLocation.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // Create shop order
  async createOrder(userId: string, dto: CreateShopOrderDto) {
    const { items, pickupLocationId } = dto;

    // Verify pickup location
    const pickupLocation = await this.prisma.pickupLocation.findUnique({
      where: { id: pickupLocationId },
    });

    if (!pickupLocation || !pickupLocation.isActive) {
      throw new NotFoundException('Pickup location not found');
    }

    // Validate items and calculate totals
    let subtotal = 0;
    let merchantId: string | null = null;
    const orderItems: Array<{
      shopItemId: string;
      quantity: number;
      price: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const shopItem = await this.prisma.shopItem.findUnique({
        where: { id: item.shopItemId },
        include: {
          merchant: {
            select: { id: true, status: true },
          },
        },
      });

      if (!shopItem) {
        throw new NotFoundException(`Item ${item.shopItemId} not found`);
      }

      if (!shopItem.inStock) {
        throw new BadRequestException(`${shopItem.name} is out of stock`);
      }

      // Verify merchant is active if item has a merchant
      if (shopItem.merchant && shopItem.merchant.status !== 'ACTIVE') {
        throw new BadRequestException(
          `${shopItem.name} is not currently available for purchase`,
        );
      }

      // Set merchantId from first item with a merchant (all items should be from same merchant ideally)
      if (shopItem.merchantId && !merchantId) {
        merchantId = shopItem.merchantId;
      }

      const itemSubtotal = shopItem.price * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({
        shopItemId: shopItem.id,
        quantity: item.quantity,
        price: shopItem.price,
        subtotal: itemSubtotal,
      });
    }

    // Calculate fees (no service fee for shop orders currently)
    const serviceFee = 0;
    const total = subtotal + serviceFee;

    // Generate order number and QR code
    const orderNumber = `PS${Date.now().toString(36).toUpperCase()}`;
    const qrCode = `PS-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        pickupLocationId,
        merchantId, // Link order to merchant
        subtotal,
        serviceFee,
        total,
        qrCode,
        status: 'PENDING',
        items: {
          create: orderItems.map((item) => ({
            shopItemId: item.shopItemId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: {
          include: {
            shopItem: true,
          },
        },
        pickupLocation: true,
        merchant: {
          select: {
            businessName: true,
            tradeName: true,
          },
        },
      },
    });

    return {
      order,
      paymentRequired: total,
    };
  }

  // Get user's shop orders
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
        items: { some: {} }, // Only orders with shop items
      },
      include: {
        items: {
          include: {
            shopItem: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        pickupLocation: {
          select: {
            name: true,
            area: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get order with QR code
  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            shopItem: true,
          },
        },
        pickupLocation: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    // Generate QR code image
    let qrCodeImage = null;
    if (order.qrCode && order.status !== 'COMPLETED') {
      qrCodeImage = await QRCode.toDataURL(order.qrCode, {
        width: 300,
        margin: 2,
      });
    }

    return {
      ...order,
      qrCodeImage,
    };
  }

  // Validate pickup at supermarket
  async validatePickup(dto: ValidatePickupDto) {
    const order = await this.prisma.order.findUnique({
      where: { qrCode: dto.qrCode },
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
        pickupLocation: {
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

    if (order.status !== 'PAID' && order.status !== 'READY_FOR_PICKUP') {
      return {
        valid: false,
        message: 'Order not ready for pickup',
        status: order.status,
      };
    }

    // Mark order as completed
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        pickedUpAt: new Date(),
      },
    });

    return {
      valid: true,
      message: 'Order pickup confirmed',
      order: {
        orderNumber: order.orderNumber,
        items: order.items.map((i) => ({
          name: i.shopItem.name,
          quantity: i.quantity,
        })),
        customer: order.user.name || order.user.phone,
        pickupLocation: order.pickupLocation?.name,
      },
    };
  }
}
