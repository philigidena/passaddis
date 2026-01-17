import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

// Profile DTOs
export class CreateShopOwnerProfileDto {
  @IsString()
  businessName: string;

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
