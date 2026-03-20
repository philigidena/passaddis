import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  Headers,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import {
  InitiatePaymentDto,
  TelebirrCallbackDto,
} from './dto/payments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private paymentsService: PaymentsService) {}

  /**
   * Initiate a payment for an order
   * Returns a checkout URL to redirect user to Telebirr
   */
  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    this.logger.log(`[INITIATE] userId=${userId} orderId=${dto.orderId} method=${dto.method ?? 'TELEBIRR'}`);
    try {
      const result = await this.paymentsService.initiatePayment(userId, dto);
      this.logger.log(`[INITIATE] SUCCESS orderId=${dto.orderId} paymentId=${result.paymentId} tx_ref=${result.tx_ref}`);
      return result;
    } catch (err) {
      this.logger.error(`[INITIATE] FAILED orderId=${dto.orderId} error=${err?.message}`);
      throw err;
    }
  }

  /**
   * Get payment status for an order
   */
  @UseGuards(JwtAuthGuard)
  @Get('status/:orderId')
  async getPaymentStatus(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    this.logger.log(`[STATUS] userId=${userId} orderId=${orderId}`);
    const result = await this.paymentsService.getPaymentStatus(userId, orderId);
    this.logger.log(`[STATUS] orderId=${orderId} orderStatus=${result.orderStatus} paymentStatus=${result.payment?.status ?? 'NO_PAYMENT'}`);
    return result;
  }

  /**
   * Verify payment with Telebirr (polling endpoint)
   */
  @UseGuards(JwtAuthGuard)
  @Get('verify/:orderId')
  async verifyPayment(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    this.logger.log(`[VERIFY] userId=${userId} orderId=${orderId}`);
    try {
      const result = await this.paymentsService.verifyPayment(userId, orderId);
      this.logger.log(`[VERIFY] orderId=${orderId} verified=${result.verified} status=${result.status}`);
      return result;
    } catch (err) {
      this.logger.error(`[VERIFY] FAILED orderId=${orderId} error=${err?.message}`);
      throw err;
    }
  }

  /**
   * Telebirr callback/notification webhook
   * Called by Telebirr servers after payment completion
   */
  @Public()
  @Post('callback/telebirr')
  async telebirrCallback(
    @Body() data: TelebirrCallbackDto,
    @Res() res: Response,
  ) {
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log('[CALLBACK] Telebirr webhook received');
    this.logger.log(`[CALLBACK] merch_order_id=${data.merch_order_id ?? data.outTradeNo} trade_status=${data.trade_status ?? data.tradeStatus} total_amount=${data.total_amount ?? data.totalAmount}`);
    this.logger.log(`[CALLBACK] trans_id=${data.trans_id} payment_order_id=${data.payment_order_id} sign_type=${data.sign_type}`);
    this.logger.debug(`[CALLBACK] Full payload: ${JSON.stringify(data, null, 2)}`);

    const result = await this.paymentsService.handleTelebirrCallback(data);

    this.logger.log(`[CALLBACK] Processing result: success=${result.success} message=${result.message}`);
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Telebirr expects a specific response format
    // Return 200 OK to acknowledge receipt
    if (result.success) {
      return res.status(200).json({
        code: '0',
        msg: 'success',
      });
    } else {
      return res.status(200).json({
        code: '1',
        msg: result.message || 'Processing failed',
      });
    }
  }

  /**
   * Stripe webhook callback
   * Called by Stripe after checkout session completion
   */
  @Public()
  @Post('callback/stripe')
  async stripeCallback(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    this.logger.log('[STRIPE_CALLBACK] Webhook received');
    try {
      const result = await this.paymentsService.handleStripeWebhook(body, signature);
      this.logger.log(`[STRIPE_CALLBACK] Result: success=${result.success}`);
      return res.status(200).json({ received: true });
    } catch (err) {
      this.logger.error(`[STRIPE_CALLBACK] Error: ${err?.message}`);
      return res.status(400).json({ error: err?.message });
    }
  }

  /**
   * Chapa webhook callback
   */
  @Public()
  @Post('callback/chapa')
  async chapaCallback(
    @Body() body: any,
    @Headers('x-chapa-signature') signature: string,
    @Res() res: Response,
  ) {
    this.logger.log('[CHAPA_CALLBACK] Webhook received');
    try {
      const result = await this.paymentsService.handleChapaCallback(body, signature);
      this.logger.log(`[CHAPA_CALLBACK] Result: success=${result.success}`);
      return res.status(200).json(result);
    } catch (err) {
      this.logger.error(`[CHAPA_CALLBACK] Error: ${err?.message}`);
      return res.status(400).json({ error: err?.message });
    }
  }

  /**
   * Verify Stripe payment (polling endpoint for after redirect)
   */
  @UseGuards(JwtAuthGuard)
  @Get('verify-stripe/:sessionId')
  async verifyStripePayment(
    @Param('sessionId') sessionId: string,
  ) {
    return this.paymentsService.verifyStripeSession(sessionId);
  }

  /**
   * Complete test payment (only works in development mode)
   */
  @UseGuards(JwtAuthGuard)
  @Post('test/complete/:paymentId')
  async completeTestPayment(
    @CurrentUser('id') userId: string,
    @Param('paymentId') paymentId: string,
  ) {
    this.logger.log(`[TEST_COMPLETE] userId=${userId} paymentId=${paymentId}`);
    try {
      const result = await this.paymentsService.completeTestPayment(userId, paymentId);
      this.logger.log(`[TEST_COMPLETE] SUCCESS paymentId=${paymentId} orderId=${result.orderId}`);
      return result;
    } catch (err) {
      this.logger.error(`[TEST_COMPLETE] FAILED paymentId=${paymentId} error=${err?.message}`);
      throw err;
    }
  }

  /**
   * Request a refund for a completed order
   * Only the order owner can request a refund
   * Refunds are not allowed for used tickets
   */
  @UseGuards(JwtAuthGuard)
  @Post('refund/:orderId')
  async requestRefund(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
    @Body() body: { reason?: string },
  ) {
    this.logger.log(`[REFUND] userId=${userId} orderId=${orderId} reason=${body.reason ?? 'not provided'}`);
    try {
      const result = await this.paymentsService.requestRefund(userId, orderId, body.reason);
      this.logger.log(`[REFUND] SUCCESS orderId=${orderId} refundOrderId=${result.refundOrderId}`);
      return result;
    } catch (err) {
      this.logger.error(`[REFUND] FAILED orderId=${orderId} error=${err?.message}`);
      throw err;
    }
  }
}
