import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  CreateShopItemDto,
  UpdateShopItemDto,
  ShopItemQueryDto,
  UpdateStockDto,
  BulkUpdateCuratedDto,
  ReorderCuratedItemsDto,
  CancelOrderDto,
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

  // ==================== SHOP ITEM MANAGEMENT ====================

  @Get('items')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async getShopItems(
    @CurrentUser('id') userId: string,
    @Query() query: ShopItemQueryDto,
  ) {
    return this.shopOwnerService.getShopItems(userId, query);
  }

  @Get('items/curated')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async getCuratedItems(@CurrentUser('id') userId: string) {
    return this.shopOwnerService.getCuratedItems(userId);
  }

  @Get('items/low-stock')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async getLowStockItems(@CurrentUser('id') userId: string) {
    return this.shopOwnerService.getLowStockItems(userId);
  }

  @Get('items/:id')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async getShopItem(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
  ) {
    return this.shopOwnerService.getShopItem(userId, itemId);
  }

  @Post('items')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async createShopItem(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateShopItemDto,
  ) {
    return this.shopOwnerService.createShopItem(userId, dto);
  }

  @Patch('items/:id')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async updateShopItem(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateShopItemDto,
  ) {
    return this.shopOwnerService.updateShopItem(userId, itemId, dto);
  }

  @Delete('items/:id')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async deleteShopItem(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
  ) {
    return this.shopOwnerService.deleteShopItem(userId, itemId);
  }

  // ==================== CURATED ITEMS ====================

  @Post('items/curated')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async updateCuratedStatus(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkUpdateCuratedDto,
  ) {
    return this.shopOwnerService.updateCuratedStatus(userId, dto);
  }

  @Post('items/curated/reorder')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async reorderCuratedItems(
    @CurrentUser('id') userId: string,
    @Body() dto: ReorderCuratedItemsDto,
  ) {
    return this.shopOwnerService.reorderCuratedItems(userId, dto);
  }

  // ==================== STOCK MANAGEMENT ====================

  @Patch('items/:id/stock')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async updateStock(
    @CurrentUser('id') userId: string,
    @Param('id') itemId: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.shopOwnerService.updateStock(userId, itemId, dto);
  }

  // ==================== ORDER CANCELLATION ====================

  /**
   * Cancel an order
   * Only SHOP_OWNER and ADMIN roles can cancel orders
   */
  @Post('orders/:id/cancel')
  @UseGuards(RolesGuard)
  @Roles('SHOP_OWNER', 'ADMIN')
  async cancelOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.shopOwnerService.cancelOrder(userId, orderId, dto.reason);
  }
}
