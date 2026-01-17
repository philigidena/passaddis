import { AdminService } from './admin.service';
import { UpdateUserRoleDto, UserQueryDto, ApproveEventDto, RejectEventDto, EventQueryDto, VerifyOrganizerDto, OrganizerQueryDto, CreateShopItemDto, UpdateShopItemDto, CreatePickupLocationDto, UpdatePickupLocationDto } from './dto/admin.dto';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getDashboard(): Promise<{
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
    }>;
    getUsers(query: UserQueryDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            _count: {
                tickets: number;
                orders: number;
            };
            phone: string;
            email: string | null;
            name: string | null;
            isVerified: boolean;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUser(id: string): Promise<{
        organizer: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            isVerified: boolean;
            userId: string;
            businessName: string;
            logo: string | null;
            bankAccount: string | null;
            telebirrId: string | null;
        } | null;
        merchant: {
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
        } | null;
        _count: {
            tickets: number;
            orders: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        email: string | null;
        name: string | null;
        passwordHash: string | null;
        isVerified: boolean;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    updateUserRole(id: string, dto: UpdateUserRoleDto, adminId: string): Promise<{
        id: string;
        phone: string;
        email: string | null;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    getAllEvents(query: EventQueryDto): Promise<{
        data: {
            ticketsSold: number;
            revenue: number;
            organizer: {
                id: string;
                isVerified: boolean;
                businessName: string;
            } | null;
            ticketTypes: {
                id: string;
                name: string;
                price: number;
                quantity: number;
                sold: number;
            }[];
            _count: {
                tickets: number;
            };
            id: string;
            title: string;
            description: string;
            imageUrl: string | null;
            venue: string;
            address: string | null;
            city: string;
            date: Date;
            endDate: Date | null;
            category: import(".prisma/client").$Enums.EventCategory;
            status: import(".prisma/client").$Enums.EventStatus;
            isFeatured: boolean;
            submittedAt: Date | null;
            approvedAt: Date | null;
            approvedBy: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizerId: string | null;
            merchantId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPendingEvents(query: EventQueryDto): Promise<{
        data: ({
            organizer: {
                id: string;
                isVerified: boolean;
                businessName: string;
            } | null;
            ticketTypes: {
                name: string;
                price: number;
                quantity: number;
            }[];
            _count: {
                tickets: number;
            };
        } & {
            id: string;
            title: string;
            description: string;
            imageUrl: string | null;
            venue: string;
            address: string | null;
            city: string;
            date: Date;
            endDate: Date | null;
            category: import(".prisma/client").$Enums.EventCategory;
            status: import(".prisma/client").$Enums.EventStatus;
            isFeatured: boolean;
            submittedAt: Date | null;
            approvedAt: Date | null;
            approvedBy: string | null;
            rejectionReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            organizerId: string | null;
            merchantId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveEvent(id: string, adminId: string, dto: ApproveEventDto): Promise<{
        organizer: {
            businessName: string;
        } | null;
        ticketTypes: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            price: number;
            quantity: number;
            sold: number;
            maxPerOrder: number;
            eventId: string;
        }[];
    } & {
        id: string;
        title: string;
        description: string;
        imageUrl: string | null;
        venue: string;
        address: string | null;
        city: string;
        date: Date;
        endDate: Date | null;
        category: import(".prisma/client").$Enums.EventCategory;
        status: import(".prisma/client").$Enums.EventStatus;
        isFeatured: boolean;
        submittedAt: Date | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizerId: string | null;
        merchantId: string | null;
    }>;
    rejectEvent(id: string, adminId: string, dto: RejectEventDto): Promise<{
        organizer: {
            businessName: string;
        } | null;
    } & {
        id: string;
        title: string;
        description: string;
        imageUrl: string | null;
        venue: string;
        address: string | null;
        city: string;
        date: Date;
        endDate: Date | null;
        category: import(".prisma/client").$Enums.EventCategory;
        status: import(".prisma/client").$Enums.EventStatus;
        isFeatured: boolean;
        submittedAt: Date | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizerId: string | null;
        merchantId: string | null;
    }>;
    toggleFeatured(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        imageUrl: string | null;
        venue: string;
        address: string | null;
        city: string;
        date: Date;
        endDate: Date | null;
        category: import(".prisma/client").$Enums.EventCategory;
        status: import(".prisma/client").$Enums.EventStatus;
        isFeatured: boolean;
        submittedAt: Date | null;
        approvedAt: Date | null;
        approvedBy: string | null;
        rejectionReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        organizerId: string | null;
        merchantId: string | null;
    }>;
    getOrganizers(query: OrganizerQueryDto): Promise<{
        data: ({
            _count: {
                events: number;
            };
            user: {
                id: string;
                phone: string;
                email: string | null;
                name: string | null;
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    verifyOrganizer(id: string, adminId: string, dto: VerifyOrganizerDto): Promise<{
        user: {
            phone: string;
            email: string | null;
            name: string | null;
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
    }>;
    suspendOrganizer(id: string, reason: string): Promise<{
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
    getShopItems(): Promise<({
        _count: {
            orderItems: number;
        };
    } & {
        id: string;
        description: string | null;
        imageUrl: string | null;
        category: import(".prisma/client").$Enums.ShopCategory;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: number;
        inStock: boolean;
    })[]>;
    createShopItem(dto: CreateShopItemDto): Promise<{
        id: string;
        description: string | null;
        imageUrl: string | null;
        category: import(".prisma/client").$Enums.ShopCategory;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: number;
        inStock: boolean;
    }>;
    updateShopItem(id: string, dto: UpdateShopItemDto): Promise<{
        id: string;
        description: string | null;
        imageUrl: string | null;
        category: import(".prisma/client").$Enums.ShopCategory;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: number;
        inStock: boolean;
    }>;
    deleteShopItem(id: string): Promise<{
        id: string;
        description: string | null;
        imageUrl: string | null;
        category: import(".prisma/client").$Enums.ShopCategory;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        price: number;
        inStock: boolean;
    }>;
    getPickupLocations(): Promise<({
        _count: {
            orders: number;
        };
    } & {
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        area: string;
        hours: string;
        isActive: boolean;
    })[]>;
    createPickupLocation(dto: CreatePickupLocationDto): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        area: string;
        hours: string;
        isActive: boolean;
    }>;
    updatePickupLocation(id: string, dto: UpdatePickupLocationDto): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        area: string;
        hours: string;
        isActive: boolean;
    }>;
    deletePickupLocation(id: string): Promise<{
        id: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        area: string;
        hours: string;
        isActive: boolean;
    }>;
}
