import { ShopOwnerService } from './shop-owner.service';
import { CreateShopOwnerProfileDto, UpdateShopOwnerProfileDto, UpdateOrderStatusDto } from './dto/shop-owner.dto';
export declare class ShopOwnerController {
    private shopOwnerService;
    constructor(shopOwnerService: ShopOwnerService);
    getProfile(userId: string): Promise<({
        user: {
            id: string;
            phone: string;
            email: string | null;
            name: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        description: string | null;
        city: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        updatedAt: Date;
        isVerified: boolean;
        userId: string;
        businessName: string;
        logo: string | null;
        bankAccount: string | null;
        commissionRate: number;
        tradeName: string | null;
        merchantCode: string;
        type: import(".prisma/client").$Enums.MerchantType;
        tinNumber: string | null;
        licenseNumber: string | null;
        businessAddress: string | null;
        bankName: string | null;
        telebirrAccount: string | null;
        cbeBirrAccount: string | null;
        settlementDays: number;
        minPayout: number;
        verifiedAt: Date | null;
        verifiedBy: string | null;
    }) | null>;
    createProfile(userId: string, dto: CreateShopOwnerProfileDto): Promise<{
        id: string;
        description: string | null;
        city: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        updatedAt: Date;
        isVerified: boolean;
        userId: string;
        businessName: string;
        logo: string | null;
        bankAccount: string | null;
        commissionRate: number;
        tradeName: string | null;
        merchantCode: string;
        type: import(".prisma/client").$Enums.MerchantType;
        tinNumber: string | null;
        licenseNumber: string | null;
        businessAddress: string | null;
        bankName: string | null;
        telebirrAccount: string | null;
        cbeBirrAccount: string | null;
        settlementDays: number;
        minPayout: number;
        verifiedAt: Date | null;
        verifiedBy: string | null;
    }>;
    updateProfile(userId: string, dto: UpdateShopOwnerProfileDto): Promise<{
        id: string;
        description: string | null;
        city: string;
        status: import(".prisma/client").$Enums.MerchantStatus;
        createdAt: Date;
        updatedAt: Date;
        isVerified: boolean;
        userId: string;
        businessName: string;
        logo: string | null;
        bankAccount: string | null;
        commissionRate: number;
        tradeName: string | null;
        merchantCode: string;
        type: import(".prisma/client").$Enums.MerchantType;
        tinNumber: string | null;
        licenseNumber: string | null;
        businessAddress: string | null;
        bankName: string | null;
        telebirrAccount: string | null;
        cbeBirrAccount: string | null;
        settlementDays: number;
        minPayout: number;
        verifiedAt: Date | null;
        verifiedBy: string | null;
    }>;
    getDashboard(userId: string): Promise<{
        profile: {
            id: string;
            businessName: string;
            status: import(".prisma/client").$Enums.MerchantStatus;
            isVerified: boolean;
            commissionRate: number;
        };
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
        topItems: {
            id: string;
            name: string;
            soldCount: number;
            revenue: number;
        }[];
    }>;
    getOrders(userId: string, status?: string): Promise<({
        user: {
            id: string;
            phone: string;
            name: string | null;
        };
        pickupLocation: {
            id: string;
            name: string;
            area: string;
        } | null;
        items: ({
            shopItem: {
                id: string;
                category: import(".prisma/client").$Enums.ShopCategory;
                name: string;
                price: number;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            quantity: number;
            orderId: string;
            shopItemId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        qrCode: string | null;
        orderNumber: string;
        subtotal: number;
        serviceFee: number;
        platformFee: number;
        merchantAmount: number | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentRef: string | null;
        pickedUpAt: Date | null;
        settledAt: Date | null;
        pickupLocationId: string | null;
    })[]>;
    getOrder(userId: string, orderId: string): Promise<{
        user: {
            id: string;
            phone: string;
            email: string | null;
            name: string | null;
        };
        pickupLocation: {
            id: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            area: string;
            hours: string;
            isActive: boolean;
        } | null;
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            method: import(".prisma/client").$Enums.PaymentMethod;
            orderId: string;
            amount: number;
            currency: string;
            providerRef: string | null;
            providerData: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        items: ({
            shopItem: {
                id: string;
                description: string | null;
                imageUrl: string | null;
                category: import(".prisma/client").$Enums.ShopCategory;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                price: number;
                inStock: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            quantity: number;
            orderId: string;
            shopItemId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        qrCode: string | null;
        orderNumber: string;
        subtotal: number;
        serviceFee: number;
        platformFee: number;
        merchantAmount: number | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentRef: string | null;
        pickedUpAt: Date | null;
        settledAt: Date | null;
        pickupLocationId: string | null;
    }>;
    updateOrderStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto): Promise<{
        user: {
            phone: string;
            name: string | null;
        };
        items: ({
            shopItem: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            price: number;
            quantity: number;
            orderId: string;
            shopItemId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: number;
        qrCode: string | null;
        orderNumber: string;
        subtotal: number;
        serviceFee: number;
        platformFee: number;
        merchantAmount: number | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentRef: string | null;
        pickedUpAt: Date | null;
        settledAt: Date | null;
        pickupLocationId: string | null;
    }>;
    validatePickup(userId: string, qrCode: string): Promise<{
        valid: boolean;
        message: string;
        pickedUpAt?: undefined;
        order?: undefined;
    } | {
        valid: boolean;
        message: string;
        pickedUpAt: Date | null;
        order?: undefined;
    } | {
        valid: boolean;
        message: string;
        order: {
            id: string;
            orderNumber: string;
            customer: string;
            items: {
                name: string;
                quantity: number;
            }[];
            total: number;
        };
        pickedUpAt?: undefined;
    }>;
    getSalesAnalytics(userId: string, period?: 'week' | 'month' | 'year'): Promise<{
        period: "week" | "month" | "year";
        startDate: Date;
        endDate: Date;
        summary: {
            totalOrders: number;
            totalRevenue: number;
            avgOrderValue: number;
        };
        dailyBreakdown: {
            orders: number;
            revenue: number;
            date: string;
        }[];
    }>;
}
