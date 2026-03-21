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
import { SavedEventsModule } from './saved-events/saved-events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CurrencyModule } from './currency/currency.module';
import { WalletModule } from './wallet/wallet.module';
import { ReferralsModule } from './referrals/referrals.module';
import { FollowsModule } from './follows/follows.module';
import { ResaleModule } from './resale/resale.module';
import { RatingsModule } from './ratings/ratings.module';
import { DonationsModule } from './donations/donations.module';
import { SharedModule } from './shared/shared.module';
import { VenuesModule } from './venues/venues.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { InsuranceModule } from './insurance/insurance.module';
import { CorporateModule } from './corporate/corporate.module';
import { PublicApiModule } from './public-api/public-api.module';
import { BrandingModule } from './branding/branding.module';

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
    SavedEventsModule,
    NotificationsModule,
    CurrencyModule,
    WalletModule,
    ReferralsModule,
    FollowsModule,
    ResaleModule,
    RatingsModule,
    DonationsModule,
    VenuesModule,
    LoyaltyModule,
    InsuranceModule,
    CorporateModule,
    PublicApiModule,
    BrandingModule,
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
