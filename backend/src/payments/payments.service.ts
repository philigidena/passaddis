import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TelebirrProvider, TelebirrCallbackData } from './providers/telebirr.provider';
import { StripeProvider } from './providers/stripe.provider';
import { ChapaProvider } from './providers/chapa.provider';
import { TicketsService } from '../tickets/tickets.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import {
  InitiatePaymentDto,
  PaymentMethod,
  TelebirrCallbackDto,
} from './dto/payments.dto';

// Payment method type for database
type PaymentMethodString = 'TELEBIRR' | 'CBE_BIRR' | 'BANK_TRANSFER';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly frontendUrl: string;
  private readonly apiUrl: string;
  private readonly defaultCommissionRate: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private telebirrProvider: TelebirrProvider,
    private stripeProvider: StripeProvider,
    private chapaProvider: ChapaProvider,
    @Inject(forwardRef(() => TicketsService))
    private ticketsService: TicketsService,
    private waitlistService: WaitlistService,
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
    this.logger.log(`[WALLET] Creating wallet transaction for order ${orderId}`);
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
      this.logger.warn(`[WALLET] No merchant found for order ${orderId} - skipping wallet transaction`);
      return;
    }
    this.logger.log(`[WALLET] Merchant found: ${merchant.businessName} (id=${merchant.id}) commissionRate=${merchant.commissionRate ?? this.defaultCommissionRate}%`);

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

    this.logger.log(`[WALLET] Credited merchant ${merchant.businessName}: gross=${grossAmount} ETB, fee=${platformFee} ETB (${commissionRate}%), net=${netAmount} ETB | balance ${balanceBefore} → ${balanceAfter} ETB`);
  }

  /**
   * Initiate payment for an order
   * Uses Telebirr WebCheckout - returns a URL to open in browser/WebView
   */
  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    this.logger.log(`[INITIATE] ── START userId=${userId} orderId=${dto.orderId}`);

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
      this.logger.warn(`[INITIATE] Order not found: ${dto.orderId}`);
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      this.logger.warn(`[INITIATE] Order ${dto.orderId} belongs to different user`);
      throw new NotFoundException('Order not found');
    }

    this.logger.log(`[INITIATE] Order found: ${order.id} orderNumber=${order.orderNumber} status=${order.status} total=${order.total} ETB type=${order.tickets.length > 0 ? 'TICKET' : 'SHOP'}`);

    if (order.status !== 'PENDING') {
      this.logger.warn(`[INITIATE] Order ${order.id} is not PENDING (current: ${order.status})`);
      throw new BadRequestException('Order is not pending payment');
    }

    // Check if payment already exists and is completed
    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    if (existingPayment) {
      this.logger.log(`[INITIATE] Existing payment found: id=${existingPayment.id} status=${existingPayment.status} providerRef=${existingPayment.providerRef}`);
    }

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      this.logger.warn(`[INITIATE] Order ${order.id} already paid`);
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
    this.logger.log(`[INITIATE] Payment title: "${title}"`);

    const method = dto.method || PaymentMethod.TELEBIRR;
    const methodStr = method as string as PaymentMethodString;

    // Create or update payment record
    const payment = await this.prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: order.total,
        method: methodStr,
        status: 'PENDING',
      },
      update: {
        method: methodStr,
        status: 'PENDING',
      },
    });
    this.logger.log(`[INITIATE] Payment record upserted: id=${payment.id} status=PENDING amount=${payment.amount} method=${method}`);

    // Return URL — redirect to payment confirmation page
    const isTicketOrder = order.tickets.length > 0 || (order as any).ticketMetadata;
    const returnUrl = isTicketOrder
      ? `${this.frontendUrl}/payment/confirmation?payment_status=success&order_id=${order.id}`
      : `${this.frontendUrl}/payment/confirmation?payment_status=success&order_id=${order.id}&shop=true`;

    // ─── STRIPE FLOW ───
    if (method === PaymentMethod.STRIPE) {
      this.logger.log(`[INITIATE] Using Stripe for international payment`);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const cancelUrl = `${this.frontendUrl}/events`;

      const stripeResult = await this.stripeProvider.createCheckoutSession({
        amount: order.total,
        currency: (dto as any).currency || 'USD',
        orderId: order.id,
        title,
        customerEmail: user?.email || undefined,
        successUrl: returnUrl,
        cancelUrl,
        metadata: { orderNumber: order.orderNumber },
      });

      if (!stripeResult.success) {
        this.logger.error(`[INITIATE] Stripe payment FAILED: ${stripeResult.error}`);
        throw new BadRequestException(stripeResult.error || 'Payment initialization failed');
      }

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerRef: stripeResult.sessionId,
          status: 'PROCESSING',
          providerData: { sessionId: stripeResult.sessionId } as any,
        },
      });

      this.logger.log(`[INITIATE] ── DONE Stripe checkout session created for order ${order.id}`);

      return {
        paymentId: payment.id,
        orderId: order.id,
        amount: order.total,
        method: 'STRIPE',
        success: true,
        checkout_url: stripeResult.checkoutUrl,
        tx_ref: stripeResult.sessionId,
      };
    }

    // ─── CHAPA FLOW ───
    if (method === PaymentMethod.CHAPA) {
      this.logger.log(`[INITIATE] Using Chapa unified gateway`);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true, email: true },
      });

      const chapaResult = await this.chapaProvider.initiatePayment({
        amount: order.total,
        currency: 'ETB',
        phone: user?.phone || '',
        email: user?.email || undefined,
        tx_ref: `PA-${order.id}-${Date.now()}`,
        callback_url: `${this.apiUrl}/api/payments/callback/chapa`,
        return_url: returnUrl,
        customization: {
          title: 'PassAddis',
          description: title,
        },
      });

      if (!chapaResult.success) {
        this.logger.error(`[INITIATE] Chapa payment FAILED: ${chapaResult.error}`);
        throw new BadRequestException(chapaResult.error || 'Payment initialization failed');
      }

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerRef: chapaResult.tx_ref,
          status: 'PROCESSING',
          method: 'CHAPA',
          providerData: { tx_ref: chapaResult.tx_ref } as any,
        },
      });

      this.logger.log(`[INITIATE] ── DONE Chapa checkout URL generated for order ${order.id}`);

      return {
        paymentId: payment.id,
        orderId: order.id,
        amount: order.total,
        method: 'CHAPA',
        success: true,
        checkout_url: chapaResult.checkout_url,
        tx_ref: chapaResult.tx_ref,
      };
    }

    // ─── TELEBIRR FLOW (default) ───
    const notifyUrl = `${this.apiUrl}/api/payments/callback/telebirr`;

    this.logger.log(`[INITIATE] notifyUrl=${notifyUrl}`);
    this.logger.log(`[INITIATE] returnUrl=${returnUrl}`);

    // Initiate Telebirr payment
    this.logger.log(`[INITIATE] Calling Telebirr API...`);
    const result = await this.telebirrProvider.initiatePayment({
      amount: order.total,
      orderId: order.id,
      title: title,
      notifyUrl: notifyUrl,
      returnUrl: returnUrl,
      callbackInfo: `Order-${order.id}`,
    });

    if (!result.success) {
      this.logger.error(`[INITIATE] Telebirr payment initiation FAILED: ${result.error}`);
      throw new BadRequestException(result.error || 'Payment initialization failed');
    }

    this.logger.log(`[INITIATE] Telebirr responded: prepayId=${result.prepayId} outTradeNo=${result.outTradeNo}`);

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
    this.logger.log(`[INITIATE] Payment updated to PROCESSING providerRef=${result.outTradeNo}`);
    this.logger.log(`[INITIATE] ── DONE checkout URL generated for order ${order.id}`);

    return {
      paymentId: payment.id,
      orderId: order.id,
      amount: order.total,
      method: 'TELEBIRR',
      success: true,
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
    this.logger.log(`[CALLBACK] ── START processing Telebirr callback`);

    // Normalize field names (Telebirr may use different formats)
    const outTradeNo = data.outTradeNo || data.merch_order_id;
    const transactionNo = data.transactionNo || data.transaction_no || data.payment_order_id;
    const tradeStatus = data.tradeStatus || data.trade_status;
    const totalAmount = data.totalAmount || data.total_amount;

    this.logger.log(`[CALLBACK] Normalized: outTradeNo=${outTradeNo} tradeStatus=${tradeStatus} totalAmount=${totalAmount} transactionNo=${transactionNo}`);

    if (!outTradeNo) {
      this.logger.error('[CALLBACK] Missing order reference in callback');
      return { success: false, message: 'Missing order reference' };
    }

    // Verify callback signature (critical security check)
    this.logger.log(`[CALLBACK] Step 1: Verifying signature (sign_type=${data.sign_type}) sign=${data.sign ? data.sign.substring(0, 20) + '...' : 'MISSING'}`);
    const verified = await this.telebirrProvider.verifyCallback(data as TelebirrCallbackData);
    if (!verified) {
      this.logger.error('[CALLBACK] SECURITY: Signature verification FAILED - possible fraud attempt');
      return { success: false, message: 'Signature verification failed' };
    }
    this.logger.log('[CALLBACK] Step 1: Signature verified ✓');

    // Find payment by provider reference
    this.logger.log(`[CALLBACK] Step 2: Looking up payment by providerRef=${outTradeNo}`);
    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: outTradeNo },
      include: { order: true },
    });

    if (!payment) {
      this.logger.error(`[CALLBACK] Payment not found for providerRef=${outTradeNo}`);
      return { success: false, message: 'Payment not found' };
    }
    this.logger.log(`[CALLBACK] Step 2: Payment found: id=${payment.id} status=${payment.status} amount=${payment.amount} orderId=${payment.orderId}`);

    // Prevent duplicate processing (idempotency check)
    if (payment.status === 'COMPLETED') {
      this.logger.warn(`[CALLBACK] Payment already COMPLETED, skipping duplicate: ${outTradeNo}`);
      return { success: true, message: 'Payment already processed' };
    }

    // Validate payment amount matches order total (prevent amount manipulation attacks)
    this.logger.log(`[CALLBACK] Step 3: Amount validation - callback=${totalAmount} expected=${payment.amount}`);
    if (totalAmount) {
      const callbackAmount = parseFloat(totalAmount);
      const expectedAmount = payment.amount;
      // Allow small rounding differences (0.01 ETB tolerance)
      if (Math.abs(callbackAmount - expectedAmount) > 0.01) {
        this.logger.error(`[CALLBACK] SECURITY: Amount mismatch callback=${callbackAmount} expected=${expectedAmount} - possible fraud`);
        return { success: false, message: 'Amount validation failed' };
      }
      this.logger.log(`[CALLBACK] Step 3: Amount validated ✓ (${callbackAmount} ETB)`);
    } else {
      this.logger.warn('[CALLBACK] Step 3: No amount in callback - skipping amount validation');
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

    this.logger.log(`[CALLBACK] Step 4: Trade status="${tradeStatus}" → isSuccess=${isSuccess}`);

    // Update payment and order status
    this.logger.log(`[CALLBACK] Step 5: Updating DB - payment → ${isSuccess ? 'COMPLETED' : 'FAILED'}, order → ${isSuccess ? 'PAID' : 'PENDING'}`);
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
          this.logger.log(`[CALLBACK] Step 5a: Deducting stock for ${order.items.length} item(s) in order ${order.id}`);
          for (const item of order.items) {
            await tx.shopItem.update({
              where: { id: item.shopItemId },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });
            this.logger.log(`[CALLBACK] Stock -${item.quantity} for shopItemId=${item.shopItemId}`);
          }
        } else {
          this.logger.log(`[CALLBACK] Step 5a: No shop items - skipping stock deduction`);
        }

        // Create wallet transaction for merchant
        this.logger.log(`[CALLBACK] Step 5b: Creating wallet transaction`);
        await this.createWalletTransaction(payment.orderId, tx);
      }
    });
    this.logger.log(`[CALLBACK] Step 5: DB updated ✓`);

    // Create tickets for paid ticket orders (outside transaction to avoid deadlocks)
    if (isSuccess) {
      this.logger.log(`[CALLBACK] Step 6: Creating tickets for order ${payment.orderId}`);
      try {
        await this.ticketsService.createTicketsForPaidOrder(payment.orderId);
        this.logger.log(`[CALLBACK] Step 6: Tickets created ✓`);
      } catch (error) {
        this.logger.error(`[CALLBACK] Step 6: Failed to create tickets for order ${payment.orderId}: ${error?.message}`);
        // Don't fail the callback - payment is still successful
      }
    }

    this.logger.log(`[CALLBACK] ── DONE: success=${isSuccess} outTradeNo=${outTradeNo}`);
    return { success: true, message: 'Payment processed' };
  }

  /**
   * Verify payment status with Telebirr
   * Can be called from frontend to poll for payment completion
   */
  async verifyPayment(userId: string, orderId: string) {
    this.logger.log(`[VERIFY] ── START userId=${userId} orderId=${orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      this.logger.warn(`[VERIFY] Order not found: ${orderId}`);
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      this.logger.warn(`[VERIFY] Order ${orderId} belongs to different user`);
      throw new NotFoundException('Order not found');
    }

    if (!order.payment) {
      this.logger.warn(`[VERIFY] No payment record for order ${orderId}`);
      throw new NotFoundException('Payment not found');
    }

    this.logger.log(`[VERIFY] Payment found: id=${order.payment.id} status=${order.payment.status} providerRef=${order.payment.providerRef}`);

    // If already completed, return success
    if (order.payment.status === 'COMPLETED') {
      this.logger.log(`[VERIFY] Payment already COMPLETED - returning cached status`);
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
      this.logger.log(`[VERIFY] Querying Telebirr for providerRef=${order.payment.providerRef}`);
      const queryResult = await this.telebirrProvider.queryPaymentStatus(order.payment.providerRef);

      this.logger.log(`[VERIFY] Telebirr query response: ${JSON.stringify(queryResult?.biz_content ?? queryResult)}`);

      // Check if payment completed
      // NOTE: PAY_SUCCESS included here (fixes inconsistency with handleTelebirrCallback)
      const tradeStatus = queryResult.biz_content?.trade_status || queryResult.trade_status;
      const isSuccess =
        tradeStatus === 'Completed' ||
        tradeStatus === 'PAY_SUCCESS' ||
        tradeStatus === 'SUCCESS' ||
        tradeStatus === '2' ||
        tradeStatus === 'TRADE_SUCCESS';

      this.logger.log(`[VERIFY] trade_status="${tradeStatus}" → isSuccess=${isSuccess}`);

      if (isSuccess && (order.payment.status as string) !== 'COMPLETED') {
        this.logger.log(`[VERIFY] Payment confirmed by Telebirr - updating DB`);
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
            this.logger.log(`[VERIFY] Deducting stock for ${fullOrder.items.length} item(s)`);
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
        this.logger.log(`[VERIFY] Creating tickets for order ${order.id}`);
        try {
          await this.ticketsService.createTicketsForPaidOrder(order.id);
          this.logger.log(`[VERIFY] Tickets created ✓`);
        } catch (error) {
          this.logger.error(`[VERIFY] Failed to create tickets for order ${order.id}: ${error?.message}`);
        }

        this.logger.log(`[VERIFY] ── DONE: verified=true orderId=${orderId}`);
        return {
          verified: true,
          status: 'COMPLETED',
          order: {
            id: order.id,
            status: 'PAID',
          },
        };
      }

      this.logger.log(`[VERIFY] Telebirr payment not yet complete (status=${tradeStatus ?? 'N/A'})`);
    } else {
      this.logger.warn(`[VERIFY] No providerRef on payment - cannot query Telebirr`);
    }

    this.logger.log(`[VERIFY] ── DONE: verified=false status=${order.payment.status}`);
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
    this.logger.log(`[STATUS] Fetching payment status userId=${userId} orderId=${orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      this.logger.warn(`[STATUS] Order not found: ${orderId}`);
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      this.logger.warn(`[STATUS] Order ${orderId} belongs to different user`);
      throw new NotFoundException('Order not found');
    }

    this.logger.log(`[STATUS] orderId=${orderId} orderStatus=${order.status} paymentStatus=${order.payment?.status ?? 'NO_PAYMENT'} paymentId=${order.payment?.id ?? 'N/A'}`);

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
      this.logger.error(`[TEST_COMPLETE] Failed to create tickets for order ${payment.orderId}: ${error?.message}`);
    }

    this.logger.log(`[TEST_COMPLETE] Payment ${paymentId} completed for order ${payment.orderId}`);

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
    this.logger.log(`[REFUND] ── START userId=${userId} orderId=${orderId} reason="${reason ?? 'not provided'}"`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        tickets: true,
        items: true,
      },
    });

    if (!order) {
      this.logger.warn(`[REFUND] Order not found: ${orderId}`);
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      this.logger.warn(`[REFUND] Order ${orderId} belongs to different user`);
      throw new NotFoundException('Order not found');
    }

    this.logger.log(`[REFUND] Order found: ${order.id} status=${order.status} paymentStatus=${order.payment?.status ?? 'NONE'} tickets=${order.tickets.length} items=${order.items.length}`);

    if (!order.payment || order.payment.status !== 'COMPLETED') {
      this.logger.warn(`[REFUND] No completed payment for order ${orderId} (paymentStatus=${order.payment?.status ?? 'NONE'})`);
      throw new BadRequestException('No completed payment found for this order');
    }

    if (order.status === 'REFUNDED') {
      this.logger.warn(`[REFUND] Order ${orderId} already refunded`);
      throw new BadRequestException('Order has already been refunded');
    }

    // Check if tickets have been used (scanned)
    const usedTickets = order.tickets.filter((t) => t.status === 'USED');
    if (usedTickets.length > 0) {
      this.logger.warn(`[REFUND] ${usedTickets.length} ticket(s) already used - cannot refund`);
      throw new BadRequestException(
        `Cannot refund: ${usedTickets.length} ticket(s) have already been used`,
      );
    }

    // Get transaction reference from payment
    const transactionId = order.payment.providerRef || order.paymentRef;
    if (!transactionId) {
      this.logger.error(`[REFUND] No providerRef or paymentRef found for order ${orderId}`);
      throw new BadRequestException('Payment transaction reference not found');
    }

    this.logger.log(`[REFUND] Requesting refund from Telebirr: transactionId=${transactionId} amount=${order.payment.amount} ETB`);

    // Request refund from Telebirr
    const refundResult = await this.telebirrProvider.refundPayment({
      orderId: transactionId,
      transactionId: transactionId,
      amount: order.payment.amount,
      reason: reason || 'Customer requested refund',
    });

    if (!refundResult.success) {
      this.logger.error(`[REFUND] Telebirr refund FAILED: ${refundResult.error}`);
      throw new BadRequestException(refundResult.error || 'Refund request failed');
    }

    this.logger.log(`[REFUND] Telebirr refund accepted: refundOrderId=${refundResult.refundOrderId} status=${refundResult.refundStatus}`);

    // Update order and payment status
    this.logger.log(`[REFUND] Updating DB: payment → REFUNDED, order → REFUNDED`);
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
        const validTickets = order.tickets.filter(t => t.status === 'VALID');
        this.logger.log(`[REFUND] Cancelling ${validTickets.length} valid ticket(s)`);
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
        this.logger.log(`[REFUND] Ticket availability restored`);
      }

      // Restore stock for shop items
      if (order.items.length > 0) {
        this.logger.log(`[REFUND] Restoring stock for ${order.items.length} item(s)`);
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
    this.logger.log(`[REFUND] DB updated ✓`);

    this.logger.log(`[REFUND] ── DONE: order ${order.id} refunded, refundOrderId=${refundResult.refundOrderId}`);

    // Trigger waitlist auto-upgrade if ticket refund freed up availability
    if (order.tickets.length > 0) {
      const eventId = order.tickets[0].eventId;
      try {
        const upgradeResult = await this.waitlistService.autoUpgradeWaitlist(
          eventId,
          order.tickets[0].ticketTypeId,
        );
        if (upgradeResult.upgraded > 0) {
          this.logger.log(`[WAITLIST] Auto-upgraded ${upgradeResult.upgraded} waitlisted users for event ${eventId}`);
        }
      } catch (error) {
        this.logger.warn(`[WAITLIST] Auto-upgrade failed: ${error.message}`);
      }
    }

    return {
      success: true,
      message: 'Refund processed successfully',
      refundOrderId: refundResult.refundOrderId,
      refundStatus: refundResult.refundStatus,
    };
  }

  /**
   * Handle Chapa webhook/callback
   */
  async handleChapaCallback(payload: any, signature?: string) {
    this.logger.log(`[CHAPA_CALLBACK] Received: tx_ref=${payload.tx_ref} status=${payload.status}`);

    // Verify webhook signature if provided
    if (signature && !this.chapaProvider.verifyWebhook(signature, JSON.stringify(payload))) {
      this.logger.error('[CHAPA_CALLBACK] Invalid webhook signature');
      return { success: false, message: 'Invalid signature' };
    }

    const txRef = payload.tx_ref || payload.trx_ref;
    if (!txRef) {
      this.logger.error('[CHAPA_CALLBACK] Missing tx_ref');
      return { success: false, message: 'Missing transaction reference' };
    }

    // Find payment by provider reference
    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: txRef },
      include: { order: true },
    });

    if (!payment) {
      this.logger.error(`[CHAPA_CALLBACK] Payment not found for tx_ref=${txRef}`);
      return { success: false, message: 'Payment not found' };
    }

    if (payment.status === 'COMPLETED') {
      return { success: true, message: 'Already processed' };
    }

    // Verify with Chapa API
    const verification = await this.chapaProvider.verifyPayment(txRef);
    const isSuccess = verification?.status === 'success' ||
      payload.status === 'success' ||
      payload.status === 'completed';

    this.logger.log(`[CHAPA_CALLBACK] Verification: ${JSON.stringify(verification?.status)} isSuccess=${isSuccess}`);

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'COMPLETED' : 'FAILED',
          providerData: { ...payload, verification } as any,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: isSuccess ? 'PAID' : 'PENDING',
          paymentMethod: 'CHAPA',
          paymentRef: payload.reference || txRef,
        },
      });

      if (isSuccess) {
        // Deduct stock for shop orders
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
          include: { items: true },
        });

        if (order && order.items.length > 0) {
          for (const item of order.items) {
            await tx.shopItem.update({
              where: { id: item.shopItemId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
          }
        }

        await this.createWalletTransaction(payment.orderId, tx);
      }
    });

    if (isSuccess) {
      try {
        await this.ticketsService.createTicketsForPaidOrder(payment.orderId);
      } catch (error) {
        this.logger.error(`[CHAPA_CALLBACK] Ticket creation failed: ${error?.message}`);
      }
    }

    return { success: true, message: 'Payment processed' };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(event: any, signature: string) {
    this.logger.log(`[STRIPE_WEBHOOK] Event type: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        this.logger.warn('[STRIPE_WEBHOOK] No orderId in session metadata');
        return { success: false, message: 'No orderId' };
      }

      if (session.payment_status === 'paid') {
        return this.completeStripePayment(orderId, session.id, session.payment_intent);
      }
    }

    return { success: true, message: 'Event acknowledged' };
  }

  /**
   * Verify a Stripe checkout session (polling from frontend)
   */
  async verifyStripeSession(sessionId: string) {
    const session = await this.stripeProvider.retrieveSession(sessionId);

    if (!session) {
      return { verified: false, status: 'unknown' };
    }

    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === 'paid') {
      // Ensure payment is marked complete
      const payment = await this.prisma.payment.findFirst({
        where: { providerRef: sessionId },
      });

      if (payment && payment.status !== 'COMPLETED') {
        await this.completeStripePayment(orderId, sessionId, session.payment_intent);
      }

      return { verified: true, status: 'paid', orderId };
    }

    return { verified: false, status: session.payment_status || 'pending' };
  }

  /**
   * Complete a Stripe payment — mark order as paid and create tickets
   */
  private async completeStripePayment(orderId: string, sessionId: string, paymentIntentId?: string) {
    this.logger.log(`[STRIPE] Completing payment for order ${orderId}`);

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId, status: { not: 'COMPLETED' } },
        data: {
          status: 'COMPLETED',
          providerRef: sessionId,
          providerData: { sessionId, paymentIntentId } as any,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID', paymentMethod: 'STRIPE' },
      });

      await this.createWalletTransaction(orderId, tx);
    });

    // Create tickets if this was a ticket order
    try {
      await this.ticketsService.createTicketsForPaidOrder(orderId);
    } catch (error) {
      this.logger.error(`[STRIPE] Ticket creation failed: ${error.message}`);
    }

    this.logger.log(`[STRIPE] Payment completed for order ${orderId}`);
    return { success: true, message: 'Payment completed', orderId };
  }
}
