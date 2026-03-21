import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CorporateService {
  constructor(private prisma: PrismaService) {}

  async register(
    userId: string,
    data: {
      companyName: string;
      tinNumber?: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
      billingAddress?: string;
    },
  ) {
    const existing = await this.prisma.corporateAccount.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Corporate account already exists');
    }

    return this.prisma.corporateAccount.create({
      data: {
        userId,
        companyName: data.companyName,
        tinNumber: data.tinNumber,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        billingAddress: data.billingAddress,
        isActive: true,
      },
    });
  }

  async getAccount(userId: string) {
    const account = await this.prisma.corporateAccount.findUnique({
      where: { userId },
      include: { invoices: { take: 5, orderBy: { createdAt: 'desc' } } },
    });

    if (!account) throw new NotFoundException('Corporate account not found');
    return account;
  }

  async createInvoice(userId: string, orderId: string) {
    const account = await this.prisma.corporateAccount.findUnique({
      where: { userId },
    });

    if (!account || !account.isActive) {
      throw new BadRequestException('Active corporate account required');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new NotFoundException('Order not found');

    const count = await this.prisma.invoice.count({ where: { accountId: account.id } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + account.paymentTerms);

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        accountId: account.id,
        orderId: order.id,
        subtotal: order.subtotal,
        tax: order.subtotal * 0.15,
        total: order.total,
        dueDate,
        items: [{
          description: `Order ${order.orderNumber}`,
          quantity: 1,
          unitPrice: order.subtotal,
          total: order.subtotal,
        }],
        status: 'SENT',
      },
    });
  }

  async getInvoices(userId: string, page = 1, limit = 20) {
    const account = await this.prisma.corporateAccount.findUnique({
      where: { userId },
    });

    if (!account) throw new NotFoundException('Corporate account not found');

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where: { accountId: account.id } }),
    ]);

    return {
      invoices,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getInvoice(userId: string, invoiceId: string) {
    const account = await this.prisma.corporateAccount.findUnique({
      where: { userId },
    });

    if (!account) throw new NotFoundException('Corporate account not found');

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.accountId !== account.id) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }
}
