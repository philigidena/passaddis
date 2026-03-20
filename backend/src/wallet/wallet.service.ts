import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CurrencyService } from '../currency/currency.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StripeProvider } from '../payments/providers/stripe.provider';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private currencyService: CurrencyService,
    private notificationsService: NotificationsService,
    private stripeProvider: StripeProvider,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';
  }

  /**
   * Get or create a user wallet
   */
  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.userWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.userWallet.create({
        data: { userId, balance: 0 },
      });
    }

    return wallet;
  }

  /**
   * Get wallet with recent transactions
   */
  async getWalletWithTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.getOrCreateWallet(userId);

    const [transactions, total] = await Promise.all([
      this.prisma.userWalletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.userWalletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      balance: wallet.balance,
      transactions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Top up wallet (diaspora user loads money)
   * Called after Stripe payment is confirmed
   */
  async topUp(
    userId: string,
    amountETB: number,
    currency: string = 'ETB',
    originalAmount?: number,
    exchangeRate?: number,
    paymentRef?: string,
  ) {
    const wallet = await this.getOrCreateWallet(userId);

    const [updatedWallet] = await this.prisma.$transaction([
      this.prisma.userWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amountETB } },
      }),
      this.prisma.userWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'TOP_UP',
          amount: amountETB,
          currency,
          originalAmount,
          exchangeRate,
          description: `Wallet top-up${currency !== 'ETB' ? ` (${originalAmount} ${currency})` : ''}`,
          reference: paymentRef,
        },
      }),
    ]);

    return updatedWallet;
  }

  /**
   * Send gift credit to another user
   */
  async sendGift(
    senderUserId: string,
    recipientPhone: string,
    amountETB: number,
    message?: string,
  ) {
    const senderWallet = await this.getOrCreateWallet(senderUserId);

    if (senderWallet.balance < amountETB) {
      throw new BadRequestException(
        `Insufficient balance. You have ${senderWallet.balance} ETB but tried to send ${amountETB} ETB`,
      );
    }

    // Find or create recipient
    let recipient = await this.prisma.user.findUnique({
      where: { phone: recipientPhone },
    });

    if (!recipient) {
      recipient = await this.prisma.user.create({
        data: { phone: recipientPhone },
      });
    }

    const recipientWallet = await this.getOrCreateWallet(recipient.id);
    const sender = await this.prisma.user.findUnique({
      where: { id: senderUserId },
      select: { name: true, phone: true },
    });

    const senderName = sender?.name || sender?.phone || 'Someone';

    // Transfer funds in a transaction
    await this.prisma.$transaction([
      // Debit sender
      this.prisma.userWallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amountETB } },
      }),
      this.prisma.userWalletTransaction.create({
        data: {
          walletId: senderWallet.id,
          type: 'GIFT_SENT',
          amount: -amountETB,
          description: `Gift sent to ${recipientPhone}${message ? `: ${message}` : ''}`,
          reference: recipient.id,
        },
      }),
      // Credit recipient
      this.prisma.userWallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: amountETB } },
      }),
      this.prisma.userWalletTransaction.create({
        data: {
          walletId: recipientWallet.id,
          type: 'GIFT_RECEIVED',
          amount: amountETB,
          description: `Gift from ${senderName}${message ? `: ${message}` : ''}`,
          reference: senderUserId,
          senderName,
        },
      }),
    ]);

    // Notify recipient
    await this.notificationsService.create(
      recipient.id,
      'PROMO_AVAILABLE',
      `You received ${amountETB} ETB!`,
      `${senderName} sent you ${amountETB} ETB on PassAddis.${message ? ` "${message}"` : ''} Use it to buy tickets or shop items!`,
      { amount: amountETB, senderId: senderUserId },
    );

    return {
      success: true,
      message: `Sent ${amountETB} ETB to ${recipientPhone}`,
      recipientPhone,
      amount: amountETB,
    };
  }

  /**
   * Spend from wallet (for ticket/shop purchases)
   * Returns true if wallet had sufficient balance
   */
  async spendFromWallet(userId: string, amountETB: number, orderId: string, description: string): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amountETB) {
      return false;
    }

    await this.prisma.$transaction([
      this.prisma.userWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amountETB } },
      }),
      this.prisma.userWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PURCHASE',
          amount: -amountETB,
          description,
          reference: orderId,
        },
      }),
    ]);

    return true;
  }

  /**
   * Refund to wallet
   */
  async refundToWallet(userId: string, amountETB: number, orderId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    await this.prisma.$transaction([
      this.prisma.userWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amountETB } },
      }),
      this.prisma.userWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REFUND',
          amount: amountETB,
          description: `Refund for order`,
          reference: orderId,
        },
      }),
    ]);
  }

  /**
   * Initiate a wallet top-up via Stripe (for diaspora users)
   * Creates a Stripe checkout session and returns the URL
   */
  async initiateTopUp(
    userId: string,
    amount: number,
    currency: string = 'USD',
    paymentMethod: string = 'STRIPE',
  ) {
    if (amount < 10) {
      throw new BadRequestException('Minimum top-up amount is 10');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    // Convert to ETB for wallet credit
    let amountETB = amount;
    let exchangeRate: number | undefined;

    if (currency !== 'ETB') {
      amountETB = await this.currencyService.convertToETB(amount, currency);
      exchangeRate = amountETB / amount;
    }

    const wallet = await this.getOrCreateWallet(userId);
    const topUpRef = `topup_${userId}_${Date.now()}`;

    if (paymentMethod === 'STRIPE') {
      const successUrl = `${this.frontendUrl}/wallet?topup=success&ref=${topUpRef}`;
      const cancelUrl = `${this.frontendUrl}/wallet?topup=cancelled`;

      const stripeResult = await this.stripeProvider.createCheckoutSession({
        amount,
        currency: currency.toLowerCase(),
        orderId: topUpRef,
        title: `PassAddis Wallet Top-Up (${amountETB.toFixed(0)} ETB)`,
        customerEmail: user?.email || undefined,
        successUrl,
        cancelUrl,
        metadata: {
          type: 'wallet_topup',
          userId,
          walletId: wallet.id,
          amountETB: amountETB.toString(),
          exchangeRate: exchangeRate?.toString() || '1',
        },
      });

      if (!stripeResult.success) {
        throw new BadRequestException(stripeResult.error || 'Failed to create checkout session');
      }

      this.logger.log(`[TOP_UP] Stripe session created for user ${userId}: ${amount} ${currency} = ${amountETB.toFixed(0)} ETB`);

      return {
        success: true,
        checkoutUrl: stripeResult.checkoutUrl,
        sessionId: stripeResult.sessionId,
        amount,
        currency,
        amountETB: Math.round(amountETB),
        exchangeRate,
        reference: topUpRef,
      };
    }

    throw new BadRequestException(`Payment method ${paymentMethod} is not supported for wallet top-up`);
  }

  /**
   * Complete a wallet top-up after payment confirmation
   * Called by Stripe webhook or verification polling
   */
  async completeTopUp(
    userId: string,
    amountETB: number,
    currency: string,
    originalAmount: number,
    exchangeRate: number,
    paymentRef: string,
  ) {
    const result = await this.topUp(userId, amountETB, currency, originalAmount, exchangeRate, paymentRef);

    await this.notificationsService.create(
      userId,
      'SYSTEM',
      'Wallet Top-Up Successful',
      `Your wallet has been credited with ${amountETB.toFixed(0)} ETB${currency !== 'ETB' ? ` (${originalAmount} ${currency})` : ''}.`,
      { amount: amountETB, currency, paymentRef },
    );

    this.logger.log(`[TOP_UP] Completed: user=${userId} amount=${amountETB} ETB ref=${paymentRef}`);
    return result;
  }
}
