export declare class UpdateUserRoleDto {
    role: string;
}
export declare class UserQueryDto {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
}
export declare class ApproveEventDto {
    featured?: boolean;
}
export declare class RejectEventDto {
    reason: string;
}
export declare class EventQueryDto {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class VerifyOrganizerDto {
    commissionRate?: number;
}
export declare class OrganizerQueryDto {
    status?: string;
    verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class CreateShopItemDto {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category: string;
    inStock?: boolean;
}
export declare class UpdateShopItemDto {
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    category?: string;
    inStock?: boolean;
}
export declare class CreatePickupLocationDto {
    name: string;
    area: string;
    address: string;
    hours: string;
    isActive?: boolean;
}
export declare class UpdatePickupLocationDto {
    name?: string;
    area?: string;
    address?: string;
    hours?: string;
    isActive?: boolean;
}
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
