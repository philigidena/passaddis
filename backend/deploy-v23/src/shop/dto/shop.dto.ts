import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ShopCategory {
  WATER = 'WATER',
  DRINKS = 'DRINKS',
  SNACKS = 'SNACKS',
  MERCH = 'MERCH',
}

export class ShopItemQueryDto {
  @IsOptional()
  @IsEnum(ShopCategory)
  category?: ShopCategory;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  shopItemId: string;

  @IsNumber()
  @Min(1)
  @Max(20)
  quantity: number;
}

export class CreateShopOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsString()
  @IsNotEmpty()
  pickupLocationId: string;
}

export class ValidatePickupDto {
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}
