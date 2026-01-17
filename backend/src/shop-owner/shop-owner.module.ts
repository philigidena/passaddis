import { Module } from '@nestjs/common';
import { ShopOwnerController } from './shop-owner.controller';
import { ShopOwnerService } from './shop-owner.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ShopOwnerController],
  providers: [ShopOwnerService],
  exports: [ShopOwnerService],
})
export class ShopOwnerModule {}
