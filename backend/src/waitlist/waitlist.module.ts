import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { AfroSmsProvider } from '../auth/providers/afro-sms.provider';

@Module({
  controllers: [WaitlistController],
  providers: [WaitlistService, AfroSmsProvider],
  exports: [WaitlistService],
})
export class WaitlistModule {}
