import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
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
    return this.paymentsService.initiatePayment(userId, dto);
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
    return this.paymentsService.getPaymentStatus(userId, orderId);
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
    return this.paymentsService.verifyPayment(userId, orderId);
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
    console.log('📱 Telebirr webhook received:', JSON.stringify(data, null, 2));

    const result = await this.paymentsService.handleTelebirrCallback(data);

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
   * Complete test payment (only works in development mode)
   */
  @UseGuards(JwtAuthGuard)
  @Post('test/complete/:paymentId')
  async completeTestPayment(
    @CurrentUser('id') userId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.paymentsService.completeTestPayment(userId, paymentId);
  }
}
