import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
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
import { PrismaService } from '../prisma/prisma.service';

@Controller('shop')
export class ShopController {
  constructor(
    private shopService: ShopService,
    private prisma: PrismaService,
  ) {}

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

  // ============== SEED DATA (ONE-TIME USE) ==============

  @Public()
  @Post('seed')
  async seedShopData(@Body() body: { secret: string }) {
    const SEED_SECRET = process.env.SEED_SECRET || 'PassAddis2026!Seed';

    if (body.secret !== SEED_SECRET) {
      throw new BadRequestException('Invalid seed secret');
    }

    // Check if data already exists
    const existingItems = await this.prisma.shopItem.count();
    const existingLocations = await this.prisma.pickupLocation.count();

    if (existingItems > 0 || existingLocations > 0) {
      return {
        message: 'Data already seeded',
        items: existingItems,
        locations: existingLocations,
      };
    }

    // Seed pickup locations
    const locations = await this.prisma.pickupLocation.createMany({
      data: [
        {
          name: 'Shoa Supermarket',
          area: 'Bole',
          address: 'Bole Road, near Edna Mall',
          hours: '8 AM - 10 PM',
        },
        {
          name: 'Safeway Supermarket',
          area: 'Sarbet',
          address: 'Sarbet, Lideta',
          hours: '7 AM - 9 PM',
        },
        {
          name: 'Fantu Supermarket',
          area: 'Kazanchis',
          address: 'Kazanchis, near Intercontinental',
          hours: '8 AM - 9 PM',
        },
        {
          name: 'Queens Supermarket',
          area: 'CMC',
          address: 'CMC Road, Michael',
          hours: '8 AM - 10 PM',
        },
      ],
    });

    // Seed shop items
    const items = await this.prisma.shopItem.createMany({
      data: [
        // Water
        {
          name: 'Ambo Water Pack (6)',
          price: 180,
          imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop&q=80',
          category: 'WATER',
          description: 'Pack of 6 Ambo mineral water bottles',
          inStock: true,
        },
        {
          name: 'Highland Water Pack (12)',
          price: 150,
          imageUrl: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop&q=80',
          category: 'WATER',
          description: 'Pack of 12 Highland purified water',
          inStock: true,
        },
        // Drinks
        {
          name: 'Coca-Cola Pack (6)',
          price: 210,
          imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop&q=80',
          category: 'DRINKS',
          description: '6 cans of ice-cold Coca-Cola',
          inStock: true,
        },
        {
          name: 'Mirinda & Sprite Mix',
          price: 200,
          imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop&q=80',
          category: 'DRINKS',
          description: '3 Mirinda + 3 Sprite cans',
          inStock: true,
        },
        {
          name: 'Red Bull (4 Pack)',
          price: 400,
          imageUrl: 'https://images.unsplash.com/photo-1613217786163-5896419a2574?w=400&h=400&fit=crop&q=80',
          category: 'DRINKS',
          description: 'Energy boost for all-night events',
          inStock: true,
        },
        // Snacks
        {
          name: 'Chips Party Pack',
          price: 280,
          imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop&q=80',
          category: 'SNACKS',
          description: 'Assorted chips - Lays, Pringles mix',
          inStock: true,
        },
        {
          name: 'Mixed Nuts & Dried Fruits',
          price: 250,
          imageUrl: 'https://images.unsplash.com/photo-1536591375657-fc29be29f3be?w=400&h=400&fit=crop&q=80',
          category: 'SNACKS',
          description: 'Premium healthy snack mix',
          inStock: true,
        },
        {
          name: 'Chocolate Assortment',
          price: 350,
          imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop&q=80',
          category: 'SNACKS',
          description: 'Snickers, Twix, KitKat mix',
          inStock: true,
        },
        {
          name: 'Biscuit Variety Box',
          price: 180,
          imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop&q=80',
          category: 'SNACKS',
          description: 'Assorted biscuits and cookies',
          inStock: true,
        },
        {
          name: 'Popcorn Mega Pack',
          price: 150,
          imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=400&fit=crop&q=80',
          category: 'SNACKS',
          description: 'Ready-to-eat popcorn for movies & events',
          inStock: true,
        },
        // Merch
        {
          name: 'PassAddis Event T-Shirt',
          price: 500,
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=80',
          category: 'MERCH',
          description: 'Official PassAddis branded tee',
          inStock: true,
        },
        {
          name: 'Glow Sticks Pack (10)',
          price: 120,
          imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop&q=80',
          category: 'MERCH',
          description: 'Light up your concert experience',
          inStock: false,
        },
      ],
    });

    return {
      message: 'Shop data seeded successfully',
      items: items.count,
      locations: locations.count,
    };
  }
}
