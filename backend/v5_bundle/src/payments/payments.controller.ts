import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  InitiatePaymentDto,
  TelebirrCallbackDto,
  CbeBirrCallbackDto,
  ChapaWebhookDto,
} from './dto/payments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:orderId')
  async getPaymentStatus(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.getPaymentStatus(userId, orderId);
  }

  // Telebirr webhook callback (public - called by Telebirr servers)
  @Public()
  @Post('callback/telebirr')
  async telebirrCallback(@Body() data: TelebirrCallbackDto) {
    return this.paymentsService.handleTelebirrCallback(data);
  }

  // CBE Birr webhook callback (public - called by CBE servers)
  @Public()
  @Post('callback/cbe_birr')
  async cbeBirrCallback(@Body() data: CbeBirrCallbackDto) {
    return this.paymentsService.handleCbeBirrCallback(data);
  }

  // Chapa webhook callback (public - called by Chapa servers)
  @Public()
  @Post('callback/chapa')
  async chapaCallback(
    @Body() data: ChapaWebhookDto,
    @Headers('x-chapa-signature') signature?: string,
  ) {
    return this.paymentsService.handleChapaWebhook(data, signature);
  }

  // Verify payment with Chapa (for frontend polling)
  @UseGuards(JwtAuthGuard)
  @Get('verify/:orderId')
  async verifyPayment(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.verifyChapaPayment(userId, orderId);
  }
}
