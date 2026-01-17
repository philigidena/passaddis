import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShopOwnerService } from './shop-owner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateShopOwnerProfileDto,
  UpdateShopOwnerProfileDto,
  UpdateOrderStatusDto,
} from './dto/shop-owner.dto';

@Controller('shop-owner')
@UseGuards(JwtAuthGuard)
export class ShopOwnerController {
  constructor(private shopOwnerService: ShopOwnerService) {}

  // ==================== PROFILE ====================

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.shopOwnerService.getProfile(userId);
  }

  @Post('profile')
  async createProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateShopOwnerProfileDto,
  ) {
    return this.shopOwnerService.createProfile(userId, dto);
  }

  @Patch('profile')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateShopOwnerProfileDto,
  ) {
    return this.shopOwnerService.updateProfile(userId, dto);
  }

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.shopOwnerService.getDashboard(userId);
  }

  // ==================== ORDERS ====================

  @Get('orders')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async getOrders(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.shopOwnerService.getOrders(userId, status);
  }

  @Get('orders/:id')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async getOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.shopOwnerService.getOrder(userId, orderId);
  }

  @Patch('orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async updateOrderStatus(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.shopOwnerService.updateOrderStatus(userId, orderId, dto.status);
  }

  // ==================== PICKUP VALIDATION ====================

  @Post('validate-pickup')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async validatePickup(
    @CurrentUser('id') userId: string,
    @Body('qrCode') qrCode: string,
  ) {
    return this.shopOwnerService.validatePickup(userId, qrCode);
  }

  // ==================== ANALYTICS ====================

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async getSalesAnalytics(
    @CurrentUser('id') userId: string,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.shopOwnerService.getSalesAnalytics(userId, period);
  }
}
