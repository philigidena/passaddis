import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsuranceService {
  constructor(private prisma: PrismaService) {}

  async purchase(userId: string, orderId: string, premium: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to this user');
    }

    const expectedPremium = order.total * 0.1;
    if (Math.abs(premium - expectedPremium) > 1) {
      throw new BadRequestException(
        `Premium must be 10% of order total. Expected: ${expectedPremium.toFixed(2)}`,
      );
    }

    const existing = await this.prisma.ticketInsurance.findFirst({
      where: { orderId },
    });
    if (existing) {
      throw new BadRequestException('Insurance already purchased for this order');
    }

    return this.prisma.ticketInsurance.create({
      data: {
        orderId,
        userId,
        premium,
        coverageAmount: order.total,
        status: 'ACTIVE',
      },
    });
  }

  async submitClaim(userId: string, insuranceId: string, reason: string) {
    const insurance = await this.prisma.ticketInsurance.findUnique({
      where: { id: insuranceId },
    });

    if (!insurance) throw new NotFoundException('Insurance not found');
    if (insurance.userId !== userId) {
      throw new BadRequestException('Insurance does not belong to this user');
    }
    if (insurance.status !== 'ACTIVE') {
      throw new BadRequestException(`Cannot claim insurance with status: ${insurance.status}`);
    }

    return this.prisma.ticketInsurance.update({
      where: { id: insuranceId },
      data: {
        status: 'CLAIMED',
        claimReason: reason,
        claimedAt: new Date(),
      },
    });
  }

  async getByOrderId(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to this user');
    }

    const insurance = await this.prisma.ticketInsurance.findFirst({
      where: { orderId },
    });

    return {
      hasInsurance: !!insurance,
      insurance: insurance || null,
    };
  }

  async calculatePremium(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    return {
      orderId,
      orderTotal: order.total,
      premium: order.total * 0.1,
    };
  }
}
