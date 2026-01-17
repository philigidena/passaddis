export declare class CreateShopOwnerProfileDto {
    businessName: string;
    tradeName?: string;
    description?: string;
    logo?: string;
    tinNumber?: string;
    licenseNumber?: string;
    businessAddress?: string;
    city?: string;
    bankName?: string;
    bankAccount?: string;
    telebirrAccount?: string;
}
export declare class UpdateShopOwnerProfileDto {
    businessName?: string;
    tradeName?: string;
    description?: string;
    logo?: string;
    businessAddress?: string;
    city?: string;
    bankName?: string;
    bankAccount?: string;
}
export declare class UpdateOrderStatusDto {
    status: 'READY_FOR_PICKUP' | 'COMPLETED';
}
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
