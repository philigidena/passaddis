import { Module } from '@nestjs/common';
import { ShopOwnerController } from './shop-owner.controller';
import { ShopOwnerService } from './shop-owner.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShopOwnerController],
  providers: [ShopOwnerService],
  exports: [ShopOwnerService],
})
export class ShopOwnerModule {}
