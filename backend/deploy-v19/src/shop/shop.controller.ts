import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import {
  ShopItemQueryDto,
  CreateShopOrderDto,
  ValidatePickupDto,
} from './dto/shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shop')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Public()
  @Get('items')
  async getItems(@Query() query: ShopItemQueryDto) {
    return this.shopService.getItems(query);
  }

  @Public()
  @Get('pickup-locations')
  async getPickupLocations() {
    return this.shopService.getPickupLocations();
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateShopOrderDto,
  ) {
    return this.shopService.createOrder(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getMyOrders(@CurrentUser('id') userId: string) {
    return this.shopService.getUserOrders(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  async getOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.shopService.getOrder(userId, orderId);
  }

  @Post('validate-pickup')
  async validatePickup(@Body() dto: ValidatePickupDto) {
    return this.shopService.validatePickup(dto);
  }
}
