import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ChapaProvider } from './providers/chapa.provider';
import { TelebirrProvider } from './providers/telebirr.provider';
import { CbeBirrProvider } from './providers/cbe-birr.provider';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    ChapaProvider,      // Recommended: Payment facilitator (no license)
    TelebirrProvider,   // Future: Direct integration
    CbeBirrProvider,    // Future: Direct integration
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
