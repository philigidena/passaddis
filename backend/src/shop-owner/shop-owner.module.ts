import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopOwnerController } from './shop-owner.controller';
import { ShopOwnerService } from './shop-owner.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AfroSmsProvider } from '../auth/providers/afro-sms.provider';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [ShopOwnerController],
  providers: [ShopOwnerService, AfroSmsProvider],
  exports: [ShopOwnerService],
})
export class ShopOwnerModule {}
