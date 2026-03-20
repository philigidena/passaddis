import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TelebirrProvider } from './providers/telebirr.provider';
import { StripeProvider } from './providers/stripe.provider';
import { ChapaProvider } from './providers/chapa.provider';
import { TicketsModule } from '../tickets/tickets.module';
import { WaitlistModule } from '../waitlist/waitlist.module';

@Module({
  imports: [forwardRef(() => TicketsModule), WaitlistModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    TelebirrProvider,   // Primary: Direct Telebirr C2B WebCheckout
    StripeProvider,     // International card payments (diaspora)
    ChapaProvider,      // Unified gateway (Telebirr, CBE, banks)
  ],
  exports: [PaymentsService, StripeProvider],
})
export class PaymentsModule {}
