import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TelebirrProvider } from './providers/telebirr.provider';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    TelebirrProvider,   // Primary: Direct Telebirr C2B WebCheckout
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
