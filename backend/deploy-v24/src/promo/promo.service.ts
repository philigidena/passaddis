import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePromoCodeDto,
  UpdatePromoCodeDto,
  ValidatePromoCodeDto,
  ApplyPromoCodeDto,
} from './dto/promo.dto';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  // Admin: Create a new promo code
  async createPromoCode(dto: CreatePromoCodeDto) {
    // Check if code already exists
    const existing = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException('Promo code already exists');
    }

    // Validate dates
    const validFrom = new Date(dto.validFrom);
    const validUntil = new Date(dto.validUntil);

    if (validFrom >= validUntil) {
      throw new BadRequestException('Valid from must be before valid until');
    }

    // Validate percentage discount
    if (dto.discountType === 'PERCENTAGE' && dto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    return this.prisma.promoCode.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minPurchase: dto.minPurchase,
        maxDiscount: dto.maxDiscount,
        maxUses: dto.maxUses,
        maxUsesPerUser: dto.maxUsesPerUser || 1,
        validFrom,
        validUntil,
        eventId: dto.eventId,
      },
    });
  }

  // Admin: Update a promo code
  async updatePromoCode(id: string, dto: UpdatePromoCodeDto) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    // Validate dates if both are provided
    if (dto.validFrom && dto.validUntil) {
      const validFrom = new Date(dto.validFrom);
      const validUntil = new Date(dto.validUntil);
      if (validFrom >= validUntil) {
        throw new BadRequestException('Valid from must be before valid until');
      }
    }

    return this.prisma.promoCode.update({
      where: { id },
      data: {
        description: dto.description,
        discountValue: dto.discountValue,
        minPurchase: dto.minPurchase,
        maxDiscount: dto.maxDiscount,
        maxUses: dto.maxUses,
        maxUsesPerUser: dto.maxUsesPerUser,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        isActive: dto.isActive,
      },
    });
  }

  // Admin: Delete a promo code
  async deletePromoCode(id: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
      include: { usages: true },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    // Delete usages first, then the promo code
    await this.prisma.promoCodeUsage.deleteMany({
      where: { promoCodeId: id },
    });

    return this.prisma.promoCode.delete({
      where: { id },
    });
  }

  // Admin: List all promo codes
  async listPromoCodes(options?: {
    isActive?: boolean;
    eventId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }
    if (options?.eventId) {
      where.eventId = options.eventId;
    }

    const [promoCodes, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where,
        include: {
          event: {
            select: { id: true, title: true },
          },
          _count: {
            select: { usages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.promoCode.count({ where }),
    ]);

    return {
      data: promoCodes.map((code) => ({
        ...code,
        usageCount: code._count.usages,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Get promo code details
  async getPromoCode(id: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
      include: {
        event: {
          select: { id: true, title: true },
        },
        usages: {
          take: 50,
          orderBy: { usedAt: 'desc' },
        },
      },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return promoCode;
  }

  // User: Validate a promo code (check if it can be applied)
  async validatePromoCode(dto: ValidatePromoCodeDto, userId: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!promoCode) {
      throw new BadRequestException('Invalid promo code');
    }

    // Check if active
    if (!promoCode.isActive) {
      throw new BadRequestException('This promo code is no longer active');
    }

    // Check validity period
    const now = new Date();
    if (now < promoCode.validFrom) {
      throw new BadRequestException('This promo code is not yet valid');
    }
    if (now > promoCode.validUntil) {
      throw new BadRequestException('This promo code has expired');
    }

    // Check total usage limit
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      throw new BadRequestException('This promo code has reached its usage limit');
    }

    // Check per-user usage limit
    const userUsageCount = await this.prisma.promoCodeUsage.count({
      where: {
        promoCodeId: promoCode.id,
        userId,
      },
    });

    if (userUsageCount >= promoCode.maxUsesPerUser) {
      throw new BadRequestException('You have already used this promo code');
    }

    // Check event restriction
    if (promoCode.eventId && dto.eventId !== promoCode.eventId) {
      throw new BadRequestException('This promo code is not valid for this event');
    }

    // Check minimum purchase
    if (promoCode.minPurchase && dto.subtotal < promoCode.minPurchase) {
      throw new BadRequestException(
        `Minimum purchase of ETB ${promoCode.minPurchase} required`,
      );
    }

    // Calculate discount
    let discount: number;
    if (promoCode.discountType === 'PERCENTAGE') {
      discount = (dto.subtotal * promoCode.discountValue) / 100;
      // Apply max discount cap if set
      if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
        discount = promoCode.maxDiscount;
      }
    } else {
      discount = promoCode.discountValue;
      // Can't discount more than the subtotal
      if (discount > dto.subtotal) {
        discount = dto.subtotal;
      }
    }

    return {
      valid: true,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      calculatedDiscount: Math.round(discount * 100) / 100,
      newTotal: Math.round((dto.subtotal - discount) * 100) / 100,
    };
  }

  // Internal: Apply promo code to an order
  async applyPromoCode(dto: ApplyPromoCodeDto, userId: string) {
    // First validate
    const validation = await this.validatePromoCode(
      {
        code: dto.code,
        subtotal: dto.subtotal,
      },
      userId,
    );

    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!promoCode) {
      throw new BadRequestException('Invalid promo code');
    }

    // Record usage
    await this.prisma.promoCodeUsage.create({
      data: {
        promoCodeId: promoCode.id,
        orderId: dto.orderId,
        userId,
        discount: validation.calculatedDiscount,
      },
    });

    // Increment usage count
    await this.prisma.promoCode.update({
      where: { id: promoCode.id },
      data: { usedCount: { increment: 1 } },
    });

    return {
      success: true,
      discount: validation.calculatedDiscount,
      newTotal: validation.newTotal,
    };
  }
}
