import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { ShopModule } from './shop/shop.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { OrganizerModule } from './organizer/organizer.module';
import { ShopOwnerModule } from './shop-owner/shop-owner.module';
import { PromoModule } from './promo/promo.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global rate limiting: 100 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 60 seconds
        limit: 100,  // 100 requests per minute
      },
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 5,    // 5 requests per second
      },
      {
        name: 'long',
        ttl: 60000, // 60 seconds
        limit: 30,   // 30 requests per minute (for sensitive endpoints)
      },
    ]),
    PrismaModule,
    AuthModule,
    EventsModule,
    TicketsModule,
    ShopModule,
    PaymentsModule,
    AdminModule,
    OrganizerModule,
    ShopOwnerModule,
    PromoModule,
    WaitlistModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
