import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TelebirrProvider, TelebirrCallbackData } from './providers/telebirr.provider';
import { TicketsService } from '../tickets/tickets.service';
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
  private readonly defaultCommissionRate: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private telebirrProvider: TelebirrProvider,
    @Inject(forwardRef(() => TicketsService))
    private ticketsService: TicketsService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';
    this.apiUrl = this.configService.get<string>('API_URL') || `http://localhost:${this.configService.get<string>('PORT') || 3000}`;
    this.defaultCommissionRate = this.configService.get<number>('PLATFORM_COMMISSION_RATE') || 5;
  }

  /**
   * Create wallet transaction for merchant when payment succeeds
   * This credits the merchant's wallet with the sale amount minus platform commission
   */
  private async createWalletTransaction(
    orderId: string,
    tx: any, // Prisma transaction client
  ): Promise<void> {
    // Get order with merchant info
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        merchant: true,
        items: {
          include: {
            shopItem: {
              include: { merchant: true },
            },
          },
        },
        tickets: {
          include: {
            event: {
              include: { merchant: true },
            },
          },
        },
      },
    });

    if (!order) return;

    // Determine the merchant - either direct or through items/tickets
    let merchant = order.merchant;

    // For shop orders, get merchant from items
    if (!merchant && order.items.length > 0) {
      merchant = order.items[0].shopItem?.merchant;
    }

    // For ticket orders, get merchant from event
    if (!merchant && order.tickets.length > 0) {
      merchant = order.tickets[0].event?.merchant;
    }

    if (!merchant) {
      console.warn(`⚠️ No merchant found for order ${orderId} - skipping wallet transaction`);
      return;
    }

    // Calculate commission
    const commissionRate = merchant.commissionRate || this.defaultCommissionRate;
    const grossAmount = order.subtotal;
    const platformFee = Math.round(grossAmount * (commissionRate / 100) * 100) / 100;
    const netAmount = grossAmount - platformFee;

    // Get current wallet balance
    const currentBalance = await tx.walletTransaction.aggregate({
      where: { merchantId: merchant.id },
      _sum: { netAmount: true },
    });
    const balanceBefore = currentBalance._sum.netAmount || 0;
    const balanceAfter = balanceBefore + netAmount;

    // Create wallet transaction
    await tx.walletTransaction.create({
      data: {
        merchantId: merchant.id,
        orderId: order.id,
        type: 'CREDIT',
        amount: grossAmount,
        fee: platformFee,
        netAmount: netAmount,
        balanceBefore,
        balanceAfter,
        status: 'COMPLETED',
        description: `Sale: Order ${order.orderNumber}`,
        reference: order.id,
      },
    });

    // Update order with merchant amount
    await tx.order.update({
      where: { id: orderId },
      data: {
        merchantAmount: netAmount,
        platformFee: platformFee,
      },
    });

    console.log(`💰 Wallet credited for merchant ${merchant.businessName}: ${netAmount} ETB (${commissionRate}% commission: ${platformFee} ETB)`);
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
      callbackInfo: `Order-${order.id}`,
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
      raw_request: result.rawRequest,
      web_base_url: 'https://196.188.120.3:38443/payment/web/paygate',
      tx_ref: result.outTradeNo,
    };
  }

  /**
   * Handle Telebirr callback/webhook
   * Called by Telebirr after payment completion
   *
   * Security checks:
   * 1. Verify callback signature using Telebirr's public key
   * 2. Validate payment amount matches order total
   * 3. Prevent duplicate processing
   */
  async handleTelebirrCallback(data: TelebirrCallbackDto) {
    console.log('📱 Processing Telebirr callback:', JSON.stringify(data, null, 2));

    // Normalize field names (Telebirr may use different formats)
    const outTradeNo = data.outTradeNo || data.merch_order_id;
    const transactionNo = data.transactionNo || data.transaction_no || data.payment_order_id;
    const tradeStatus = data.tradeStatus || data.trade_status;
    const totalAmount = data.totalAmount || data.total_amount;

    if (!outTradeNo) {
      console.error('❌ Missing order reference in Telebirr callback');
      return { success: false, message: 'Missing order reference' };
    }

    // Verify callback signature (critical security check)
    const verified = await this.telebirrProvider.verifyCallback(data as TelebirrCallbackData);
    if (!verified) {
      console.error('❌ Telebirr callback signature verification failed - possible fraud attempt');
      return { success: false, message: 'Signature verification failed' };
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

    // Prevent duplicate processing (idempotency check)
    if (payment.status === 'COMPLETED') {
      console.log('⚠️ Payment already completed, skipping duplicate callback:', outTradeNo);
      return { success: true, message: 'Payment already processed' };
    }

    // Validate payment amount matches order total (prevent amount manipulation attacks)
    if (totalAmount) {
      const callbackAmount = parseFloat(totalAmount);
      const expectedAmount = payment.amount;
      // Allow small rounding differences (0.01 ETB tolerance)
      if (Math.abs(callbackAmount - expectedAmount) > 0.01) {
        console.error(`❌ Amount mismatch: callback=${callbackAmount}, expected=${expectedAmount}`);
        console.error('❌ Possible fraud attempt - amount manipulation detected');
        return { success: false, message: 'Amount validation failed' };
      }
    }

    // Check trade status - Telebirr status values from documentation
    // Step 7 (Notify): Completed, Pending, Paying, Expired, Failure
    // Step 5 (Query): PAY_SUCCESS, PAY_FAILED, WAIT_PAY, ORDER_CLOSED, PAYING
    const isSuccess =
      tradeStatus === 'Completed' ||
      tradeStatus === 'PAY_SUCCESS' ||
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

        // Create wallet transaction for merchant
        await this.createWalletTransaction(payment.orderId, tx);
      }
    });

    // Create tickets for paid ticket orders (outside transaction to avoid deadlocks)
    if (isSuccess) {
      try {
        await this.ticketsService.createTicketsForPaidOrder(payment.orderId);
      } catch (error) {
        console.error(`❌ Failed to create tickets for order ${payment.orderId}:`, error);
        // Don't fail the callback - payment is still successful
      }
    }

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

          // Create wallet transaction for merchant
          await this.createWalletTransaction(order.id, tx);
        });

        // Create tickets for paid ticket orders
        try {
          await this.ticketsService.createTicketsForPaidOrder(order.id);
        } catch (error) {
          console.error(`❌ Failed to create tickets for order ${order.id}:`, error);
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

      // Create wallet transaction for merchant
      await this.createWalletTransaction(payment.orderId, tx);
    });

    // Create tickets for paid ticket orders
    try {
      await this.ticketsService.createTicketsForPaidOrder(payment.orderId);
    } catch (error) {
      console.error(`❌ Failed to create tickets for order ${payment.orderId}:`, error);
    }

    console.log(`✅ Test payment completed: ${paymentId}`);

    return {
      success: true,
      message: 'Test payment completed successfully',
      orderId: payment.orderId,
    };
  }

  /**
   * Request a refund for a completed payment
   * Only admins or the order owner can request refunds
   */
  async requestRefund(userId: string, orderId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        tickets: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (!order.payment || order.payment.status !== 'COMPLETED') {
      throw new BadRequestException('No completed payment found for this order');
    }

    if (order.status === 'REFUNDED') {
      throw new BadRequestException('Order has already been refunded');
    }

    // Check if tickets have been used (scanned)
    const usedTickets = order.tickets.filter((t) => t.status === 'USED');
    if (usedTickets.length > 0) {
      throw new BadRequestException(
        `Cannot refund: ${usedTickets.length} ticket(s) have already been used`,
      );
    }

    // Get transaction reference from payment
    const transactionId = order.payment.providerRef || order.paymentRef;
    if (!transactionId) {
      throw new BadRequestException('Payment transaction reference not found');
    }

    // Request refund from Telebirr
    const refundResult = await this.telebirrProvider.refundPayment({
      orderId: transactionId,
      transactionId: transactionId,
      amount: order.payment.amount,
      reason: reason || 'Customer requested refund',
    });

    if (!refundResult.success) {
      console.error('❌ Telebirr refund failed:', refundResult.error);
      throw new BadRequestException(refundResult.error || 'Refund request failed');
    }

    // Update order and payment status
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: {
          status: 'REFUNDED',
          providerData: {
            ...(order.payment!.providerData as object || {}),
            refundOrderId: refundResult.refundOrderId,
            refundStatus: refundResult.refundStatus,
            refundedAt: new Date().toISOString(),
          } as any,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'REFUNDED',
        },
      });

      // Cancel any unused tickets
      if (order.tickets.length > 0) {
        await tx.ticket.updateMany({
          where: {
            orderId: order.id,
            status: 'VALID',
          },
          data: {
            status: 'CANCELLED',
          },
        });

        // Restore ticket availability
        for (const ticket of order.tickets) {
          if (ticket.status === 'VALID') {
            await tx.ticketType.update({
              where: { id: ticket.ticketTypeId },
              data: { sold: { decrement: 1 } },
            });
          }
        }
      }

      // Restore stock for shop items
      if (order.items.length > 0) {
        for (const item of order.items) {
          await tx.shopItem.update({
            where: { id: item.shopItemId },
            data: {
              stockQuantity: { increment: item.quantity },
            },
          });
        }
      }
    });

    console.log(`✅ Refund processed for order ${order.id}: ${refundResult.refundOrderId}`);

    return {
      success: true,
      message: 'Refund processed successfully',
      refundOrderId: refundResult.refundOrderId,
      refundStatus: refundResult.refundStatus,
    };
  }
}
