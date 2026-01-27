import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TelebirrProvider, TelebirrCallbackData } from './providers/telebirr.provider';
import {
  InitiatePaymentDto,
  PaymentMethod,
  TelebirrCallbackDto,
} from './dto/payments.dto';

// Payment method type for database
type PaymentMethodString = 'TELEBIRR' | 'CBE_BIRR' | 'BANK_TRANSFER';

@Injectable()
export class PaymentsService {
  private readonly frontendUrl: string;
  private readonly apiUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private telebirrProvider: TelebirrProvider,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';
    this.apiUrl = this.configService.get<string>('API_URL') || `http://localhost:${this.configService.get<string>('PORT') || 3000}`;
  }

  /**
   * Initiate payment for an order
   * Uses Telebirr WebCheckout - returns a URL to open in browser/WebView
   */
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

    // Check if payment already exists and is completed
    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      throw new BadRequestException('Order already paid');
    }

    // Generate title for Telebirr
    let title = 'PassAddis Order';
    if (order.tickets.length > 0) {
      const eventTitle = order.tickets[0].event.title.substring(0, 50);
      title = `Tickets - ${eventTitle}`;
    } else if (order.items.length > 0) {
      const itemName = order.items[0].shopItem.name.substring(0, 50);
      title = `Shop - ${itemName}`;
    }

    // Create or update payment record
    const payment = await this.prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: order.total,
        method: 'TELEBIRR' as PaymentMethodString,
        status: 'PENDING',
      },
      update: {
        method: 'TELEBIRR' as PaymentMethodString,
        status: 'PENDING',
      },
    });

    // URLs for Telebirr
    const notifyUrl = `${this.apiUrl}/api/payments/callback/telebirr`;

    // Return URL based on order type (ticket vs shop)
    const isTicketOrder = order.tickets.length > 0;
    const returnUrl = isTicketOrder
      ? `${this.frontendUrl}/tickets?payment_status=success&order_id=${order.id}`
      : `${this.frontendUrl}/shop/orders/${order.id}?payment_status=success`;

    // Initiate Telebirr payment
    const result = await this.telebirrProvider.initiatePayment({
      amount: order.total,
      orderId: order.id,
      title: title,
      notifyUrl: notifyUrl,
      returnUrl: returnUrl,
      callbackInfo: `Order:${order.id}`,
    });

    if (!result.success) {
      console.error('❌ Telebirr payment initiation failed:', result.error);
      throw new BadRequestException(result.error || 'Payment initialization failed');
    }

    // Update payment with Telebirr reference
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerRef: result.outTradeNo,
        status: 'PROCESSING',
        providerData: {
          prepayId: result.prepayId,
          rawRequest: result.rawRequest,
        } as any,
      },
    });

    console.log(`✅ Telebirr payment initiated for order ${order.id}: ${result.outTradeNo}`);

    return {
      paymentId: payment.id,
      orderId: order.id,
      amount: order.total,
      method: 'TELEBIRR',
      checkout_url: result.checkoutUrl,
      tx_ref: result.outTradeNo,
    };
  }

  /**
   * Handle Telebirr callback/webhook
   * Called by Telebirr after payment completion
   */
  async handleTelebirrCallback(data: TelebirrCallbackDto) {
    console.log('📱 Processing Telebirr callback:', JSON.stringify(data, null, 2));

    // Normalize field names (Telebirr may use different formats)
    const outTradeNo = data.outTradeNo || data.merch_order_id;
    const transactionNo = data.transactionNo || data.transaction_no;
    const tradeStatus = data.tradeStatus || data.trade_status;
    const totalAmount = data.totalAmount || data.total_amount;

    if (!outTradeNo) {
      console.error('❌ Missing order reference in Telebirr callback');
      return { success: false, message: 'Missing order reference' };
    }

    // Verify callback signature
    const verified = await this.telebirrProvider.verifyCallback(data as TelebirrCallbackData);
    if (!verified) {
      console.error('❌ Telebirr callback verification failed');
      return { success: false, message: 'Verification failed' };
    }

    // Find payment by provider reference
    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: outTradeNo },
      include: { order: true },
    });

    if (!payment) {
      console.error('❌ Payment not found for Telebirr callback:', outTradeNo);
      return { success: false, message: 'Payment not found' };
    }

    // Check trade status - Telebirr uses "Completed", "2", or "SUCCESS"
    const isSuccess =
      tradeStatus === 'Completed' ||
      tradeStatus === 'SUCCESS' ||
      tradeStatus === '2' ||
      tradeStatus === 'TRADE_SUCCESS';

    console.log(`📱 Telebirr payment ${isSuccess ? 'SUCCEEDED' : 'FAILED'}: ${outTradeNo}`);

    // Update payment and order status
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'COMPLETED' : 'FAILED',
          providerData: data as any,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: isSuccess ? 'PAID' : 'PENDING',
          paymentMethod: 'TELEBIRR',
          paymentRef: transactionNo || outTradeNo,
        },
      });

      // If payment successful, deduct stock for shop orders
      if (isSuccess) {
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
          include: { items: true },
        });

        if (order && order.items.length > 0) {
          for (const item of order.items) {
            await tx.shopItem.update({
              where: { id: item.shopItemId },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });
          }
          console.log(`📦 Stock deducted for order ${order.id}`);
        }
      }
    });

    return { success: true, message: 'Payment processed' };
  }

  /**
   * Verify payment status with Telebirr
   * Can be called from frontend to poll for payment completion
   */
  async verifyPayment(userId: string, orderId: string) {
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

    // If already completed, return success
    if (order.payment.status === 'COMPLETED') {
      return {
        verified: true,
        status: 'COMPLETED',
        order: {
          id: order.id,
          status: order.status,
        },
      };
    }

    // Query Telebirr for current status
    if (order.payment.providerRef) {
      const queryResult = await this.telebirrProvider.queryPaymentStatus(order.payment.providerRef);

      console.log('📱 Telebirr status query result:', JSON.stringify(queryResult, null, 2));

      // Check if payment completed
      const tradeStatus = queryResult.biz_content?.trade_status || queryResult.trade_status;
      const isSuccess =
        tradeStatus === 'Completed' ||
        tradeStatus === 'SUCCESS' ||
        tradeStatus === '2' ||
        tradeStatus === 'TRADE_SUCCESS';

      if (isSuccess && (order.payment.status as string) !== 'COMPLETED') {
        // Update payment status
        await this.prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: order.payment!.id },
            data: {
              status: 'COMPLETED',
              providerData: queryResult as any,
            },
          });

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              paymentMethod: 'TELEBIRR',
              paymentRef: queryResult.biz_content?.transaction_no || order.payment!.providerRef,
            },
          });

          // Deduct stock for shop orders
          const fullOrder = await tx.order.findUnique({
            where: { id: order.id },
            include: { items: true },
          });

          if (fullOrder && fullOrder.items.length > 0) {
            for (const item of fullOrder.items) {
              await tx.shopItem.update({
                where: { id: item.shopItemId },
                data: {
                  stockQuantity: { decrement: item.quantity },
                },
              });
            }
          }
        });

        return {
          verified: true,
          status: 'COMPLETED',
          order: {
            id: order.id,
            status: 'PAID',
          },
        };
      }
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

  /**
   * Get payment status
   */
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

  /**
   * Complete test payment (for development/testing only)
   */
  async completeTestPayment(userId: string, paymentId: string) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    // Only allow in development mode
    if (nodeEnv !== 'development') {
      throw new BadRequestException('Test payments only allowed in development mode');
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
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          providerRef: `TEST-${Date.now()}`,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paymentMethod: 'TELEBIRR',
          paymentRef: `TEST-${Date.now()}`,
        },
      });

      // Deduct stock for shop orders
      const order = await tx.order.findUnique({
        where: { id: payment.orderId },
        include: { items: true },
      });

      if (order && order.items.length > 0) {
        for (const item of order.items) {
          await tx.shopItem.update({
            where: { id: item.shopItemId },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });
        }
      }
    });

    console.log(`✅ Test payment completed: ${paymentId}`);

    return {
      success: true,
      message: 'Test payment completed successfully',
      orderId: payment.orderId,
    };
  }
}
