import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// Profile DTOs
export class CreateShopOwnerProfileDto {
  @IsString()
  @MinLength(3, { message: 'Business name must be at least 3 characters' })
  @MaxLength(100, { message: 'Business name must not exceed 100 characters' })
  businessName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Trade name must not exceed 100 characters' })
  tradeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  tinNumber?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  telebirrAccount?: string;
}

export class UpdateShopOwnerProfileDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;
}

// Order management
export class UpdateOrderStatusDto {
  @IsString()
  status: 'READY_FOR_PICKUP' | 'COMPLETED';
}

// Dashboard stats
export interface ShopOwnerDashboardStats {
  orders: {
    total: number;
    pending: number;
    ready: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    thisWeek: number;
  };
  wallet: {
    balance: number;
    pendingSettlement: number;
  };
  topItems: Array<{
    id: string;
    name: string;
    soldCount: number;
    revenue: number;
  }>;
}

// ==================== SHOP ITEM MANAGEMENT ====================

export class CreateShopItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsEnum(['WATER', 'DRINKS', 'SNACKS', 'MERCH', 'BUNDLES'])
  category: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsBoolean()
  isCurated?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  eventId?: string;
}

export class UpdateShopItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(['WATER', 'DRINKS', 'SNACKS', 'MERCH', 'BUNDLES'])
  category?: string;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsBoolean()
  isCurated?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  eventId?: string;
}

export class ShopItemQueryDto {
  @IsOptional()
  @IsEnum(['WATER', 'DRINKS', 'SNACKS', 'MERCH', 'BUNDLES'])
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  curatedOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  inStockOnly?: boolean;

  @IsOptional()
  @IsString()
  eventId?: string;
}

export class UpdateStockDto {
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkUpdateCuratedDto {
  @IsArray()
  @IsString({ each: true })
  itemIds: string[];

  @IsBoolean()
  isCurated: boolean;
}

export class ReorderCuratedItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrderDto)
  items: ItemOrderDto[];
}

export class ItemOrderDto {
  @IsString()
  id: string;

  @IsNumber()
  @Min(0)
  displayOrder: number;
}

// ==================== ORDER CANCELLATION ====================

export class CancelOrderDto {
  @IsString()
  reason: string;
}
