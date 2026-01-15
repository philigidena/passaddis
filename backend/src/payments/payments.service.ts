import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ChapaProvider } from './providers/chapa.provider';
import { TelebirrProvider } from './providers/telebirr.provider';
import { CbeBirrProvider } from './providers/cbe-birr.provider';
import {
  InitiatePaymentDto,
  PaymentMethod,
  TelebirrCallbackDto,
  CbeBirrCallbackDto,
  ChapaWebhookDto,
} from './dto/payments.dto';

// Payment method type for SQLite (string instead of enum)
type PaymentMethodString = 'CHAPA' | 'TELEBIRR' | 'CBE_BIRR' | 'BANK_TRANSFER';

@Injectable()
export class PaymentsService {
  private readonly frontendUrl: string;
  private readonly apiUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private chapaProvider: ChapaProvider,
    private telebirrProvider: TelebirrProvider,
    private cbeBirrProvider: CbeBirrProvider,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';
    this.apiUrl = this.configService.get<string>('API_URL') || `http://localhost:${this.configService.get<string>('PORT') || 3000}`;
  }

  // Initiate payment for an order
  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        tickets: {
          include: {
            event: { select: { title: true } },
          },
        },
        items: {
          include: {
            shopItem: { select: { name: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      throw new BadRequestException('Order already paid');
    }

    // Generate description (Chapa only allows letters, numbers, hyphens, underscores, spaces, dots)
    let description = 'PassAddis Order';
    if (order.tickets.length > 0) {
      const eventTitle = order.tickets[0].event.title.replace(/[^a-zA-Z0-9\-_\s.]/g, '');
      description = `Tickets for ${eventTitle}`;
    } else if (order.items.length > 0) {
      const itemNames = order.items.map((i) => i.shopItem.name.replace(/[^a-zA-Z0-9\-_\s.]/g, '')).join(' and ');
      description = `Shop order ${itemNames}`;
    }

    // Create or update payment record
    const payment = await this.prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: order.total,
        method: dto.method as PaymentMethodString,
        status: 'PENDING',
      },
      update: {
        method: dto.method as PaymentMethodString,
        status: 'PENDING',
      },
    });

    // Initiate payment with provider
    const notifyUrl = `${this.apiUrl}/api/payments/callback/${dto.method.toLowerCase()}`;
    // Return URL based on order type (ticket vs shop)
    const isTicketOrder = order.tickets.length > 0;
    const returnUrl = isTicketOrder
      ? `${this.frontendUrl}/tickets`
      : `${this.frontendUrl}/shop/orders/${order.id}`;

    let result;

    // Use Chapa as the primary payment method (handles Telebirr, CBE, Banks)
    if (dto.method === PaymentMethod.CHAPA) {
      // Get user phone for Chapa
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true, email: true },
      });

      result = await this.chapaProvider.initiatePayment({
        amount: order.total,
        currency: 'ETB',
        phone: user?.phone || '',
        email: user?.email || undefined,
        tx_ref: payment.id,
        callback_url: `${this.apiUrl}/api/payments/callback/chapa`,
        return_url: returnUrl,
        customization: {
          title: 'PassAddis Pay',
          description: description,
        },
      });

      if (result.success && result.tx_ref) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            providerRef: result.tx_ref,
            status: 'PROCESSING',
          },
        });
      }
    } else if (dto.method === PaymentMethod.TELEBIRR) {
      // Direct Telebirr (future - when you have merchant account)
      result = await this.telebirrProvider.initiatePayment({
        amount: order.total,
        orderId: order.id,
        subject: description,
        notifyUrl,
        returnUrl,
      });

      if (result.success && result.outTradeNo) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            providerRef: result.outTradeNo,
            status: 'PROCESSING',
          },
        });
      }
    } else if (dto.method === PaymentMethod.CBE_BIRR) {
      // Direct CBE Birr (future)
      result = await this.cbeBirrProvider.initiatePayment({
        amount: order.total,
        orderId: order.id,
        description,
        notifyUrl,
        returnUrl,
      });

      if (result.success && result.referenceId) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            providerRef: result.referenceId,
            status: 'PROCESSING',
          },
        });
      }
    } else {
      throw new BadRequestException('Unsupported payment method');
    }

    // Check if payment initiation was successful
    if (!result.success) {
      throw new BadRequestException(result.error || 'Payment initialization failed');
    }

    // Normalize the checkout URL from different providers
    const checkoutUrl = 'checkout_url' in result ? result.checkout_url :
                        'paymentUrl' in result ? result.paymentUrl : undefined;

    // Normalize the transaction reference from different providers
    const txRef = 'tx_ref' in result ? result.tx_ref :
                  'outTradeNo' in result ? result.outTradeNo :
                  'referenceId' in result ? result.referenceId : undefined;

    return {
      paymentId: payment.id,
      orderId: order.id,
      amount: order.total,
      method: dto.method,
      checkout_url: checkoutUrl,
      tx_ref: txRef,
    };
  }

  // Handle Telebirr callback
  async handleTelebirrCallback(data: TelebirrCallbackDto) {
    const verified = await this.telebirrProvider.verifyCallback(data);
    if (!verified) {
      console.error('Telebirr callback verification failed');
      return { success: false };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: data.outTradeNo },
    });

    if (!payment) {
      console.error('Payment not found for Telebirr callback:', data.outTradeNo);
      return { success: false };
    }

    const isSuccess = data.tradeStatus === 'SUCCESS' || data.tradeStatus === '2';

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'COMPLETED' : 'FAILED',
          providerData: data as any,
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: isSuccess ? 'PAID' : 'PENDING',
          paymentMethod: 'TELEBIRR',
          paymentRef: data.transactionNo,
        },
      }),
    ]);

    return { success: true };
  }

  // Handle CBE Birr callback
  async handleCbeBirrCallback(data: CbeBirrCallbackDto) {
    const verified = await this.cbeBirrProvider.verifyCallback(data);
    if (!verified) {
      console.error('CBE Birr callback verification failed');
      return { success: false };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: data.referenceId },
    });

    if (!payment) {
      console.error('Payment not found for CBE callback:', data.referenceId);
      return { success: false };
    }

    const isSuccess = data.status === 'SUCCESS' || data.status === 'COMPLETED';

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'COMPLETED' : 'FAILED',
          providerData: data as any,
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: isSuccess ? 'PAID' : 'PENDING',
          paymentMethod: 'CBE_BIRR',
          paymentRef: data.transactionId,
        },
      }),
    ]);

    return { success: true };
  }

  // Handle Chapa webhook callback
  async handleChapaWebhook(data: ChapaWebhookDto, signature?: string) {
    // Optionally verify webhook signature
    if (signature) {
      const isValid = this.chapaProvider.verifyWebhook(
        signature,
        JSON.stringify(data),
      );
      if (!isValid) {
        console.error('Chapa webhook signature verification failed');
        return { success: false };
      }
    }

    // Find payment by tx_ref (which is our payment.id)
    const payment = await this.prisma.payment.findUnique({
      where: { id: data.tx_ref },
    });

    if (!payment) {
      console.error('Payment not found for Chapa webhook:', data.tx_ref);
      return { success: false };
    }

    const isSuccess = data.status === 'success';

    // Map Chapa payment method to our type
    let paymentMethod: PaymentMethodString = 'CHAPA';
    if (data.payment_method) {
      const method = data.payment_method.toLowerCase();
      if (method.includes('telebirr')) {
        paymentMethod = 'TELEBIRR';
      } else if (method.includes('cbe')) {
        paymentMethod = 'CBE_BIRR';
      }
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'COMPLETED' : 'FAILED',
          providerRef: data.reference,
          providerData: data as any,
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: isSuccess ? 'PAID' : 'PENDING',
          paymentMethod: paymentMethod,
          paymentRef: data.reference,
        },
      }),
    ]);

    console.log(
      `Chapa payment ${isSuccess ? 'succeeded' : 'failed'}: ${data.tx_ref}`,
    );

    return { success: true };
  }

  // Verify Chapa payment (can be called from frontend)
  async verifyChapaPayment(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (!order.payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify with Chapa
    const verification = await this.chapaProvider.verifyPayment(order.payment.id);

    if (verification.status === 'success' && verification.data?.status === 'success') {
      // Update payment if not already completed
      if (order.payment.status !== 'COMPLETED') {
        await this.prisma.$transaction([
          this.prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              status: 'COMPLETED',
              providerRef: verification.data.reference,
              providerData: verification.data,
            },
          }),
          this.prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              paymentRef: verification.data.reference,
            },
          }),
        ]);
      }

      return {
        verified: true,
        status: 'COMPLETED',
        order: {
          id: order.id,
          status: 'PAID',
        },
      };
    }

    return {
      verified: false,
      status: order.payment.status,
      order: {
        id: order.id,
        status: order.status,
      },
    };
  }

  // Get payment status
  async getPaymentStatus(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderId: order.id,
      orderStatus: order.status,
      payment: order.payment
        ? {
            id: order.payment.id,
            amount: order.payment.amount,
            method: order.payment.method,
            status: order.payment.status,
          }
        : null,
    };
  }

  // Complete test payment (only works when Chapa is in test mode)
  async completeTestPayment(userId: string, paymentId: string) {
    const chapaKey = this.configService.get<string>('CHAPA_SECRET_KEY') || '';

    // Only allow in test mode
    if (chapaKey && !chapaKey.includes('TEST')) {
      throw new BadRequestException('Test payments only allowed in test mode');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.order.userId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'COMPLETED') {
      return { success: true, message: 'Payment already completed', order: payment.order };
    }

    // Mark payment and order as completed
    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          providerRef: `TEST-${Date.now()}`,
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paymentMethod: 'CHAPA',
          paymentRef: `TEST-${Date.now()}`,
        },
      }),
    ]);

    console.log(`✅ Test payment completed: ${paymentId}`);

    return {
      success: true,
      message: 'Test payment completed successfully',
      orderId: payment.orderId,
    };
  }
}
