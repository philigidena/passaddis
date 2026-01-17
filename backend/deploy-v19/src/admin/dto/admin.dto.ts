import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// User Management DTOs
export class UpdateUserRoleDto {
  @IsEnum(['USER', 'ORGANIZER', 'SHOP_OWNER', 'ADMIN'])
  role: string;
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['USER', 'ORGANIZER', 'SHOP_OWNER', 'ADMIN'])
  role?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Event Approval DTOs
export class ApproveEventDto {
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class RejectEventDto {
  @IsString()
  reason: string;
}

export class EventQueryDto {
  @IsOptional()
  @IsEnum(['DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'CANCELLED', 'COMPLETED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Organizer/Merchant Management DTOs
export class VerifyOrganizerDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;
}

export class OrganizerQueryDto {
  @IsOptional()
  @IsEnum(['PENDING', 'ACTIVE', 'SUSPENDED', 'BLOCKED'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// Shop Item Management DTOs
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

  @IsEnum(['WATER', 'DRINKS', 'SNACKS', 'MERCH'])
  category: string;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean = true;
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
  @IsEnum(['WATER', 'DRINKS', 'SNACKS', 'MERCH'])
  category?: string;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
}

// Pickup Location Management DTOs
export class CreatePickupLocationDto {
  @IsString()
  name: string;

  @IsString()
  area: string;

  @IsString()
  address: string;

  @IsString()
  hours: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdatePickupLocationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  hours?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Dashboard Stats Response
export interface DashboardStats {
  users: {
    total: number;
    newThisMonth: number;
    byRole: Record<string, number>;
  };
  events: {
    total: number;
    pending: number;
    published: number;
    thisMonth: number;
  };
  tickets: {
    totalSold: number;
    revenue: number;
    thisMonth: {
      sold: number;
      revenue: number;
    };
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
}
