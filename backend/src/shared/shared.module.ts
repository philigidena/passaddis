import { Module, Global } from '@nestjs/common';
import { WhatsAppProvider } from './providers/whatsapp.provider';

@Global()
@Module({
  providers: [WhatsAppProvider],
  exports: [WhatsAppProvider],
})
export class SharedModule {}
