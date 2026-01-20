import { Module } from '@nestjs/common';
import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AfroSmsProvider } from '../auth/providers/afro-sms.provider';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizerController],
  providers: [OrganizerService, AfroSmsProvider],
  exports: [OrganizerService],
})
export class OrganizerModule {}
