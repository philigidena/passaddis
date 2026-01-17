import { OrganizerService } from './organizer.service';
import { CreateOrganizerProfileDto, UpdateOrganizerProfileDto, CreateEventDto, UpdateEventDto, CreateTicketTypeDto } from './dto/organizer.dto';
export declare class OrganizerController {
    private organizerService;
    constructor(organizerService: OrganizerService);
    getProfile(userId: string): Promise<{
        isMerchant: boolean;
        user: {
            id: string;
            phone: string;
            email: string | null;
            name: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
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
    } | {
        isMerchant: boolean;
        user: {
            id: string;
            phone: string;
            email: string | null;
            name: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
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
    } | null>;
    createProfile(userId: string, dto: CreateOrganizerProfileDto): Promise<{
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
    updateProfile(userId: string, dto: UpdateOrganizerProfileDto): Promise<{
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
        events: {
            total: number;
        };
        tickets: {
            totalSold: number;
            revenue: number;
            thisMonth: {
                sold: number;
                revenue: number;
            };
        };
        wallet: {
            balance: number;
            pendingSettlement: number;
            totalEarnings: number;
        };
    }>;
    getMyEvents(userId: string): Promise<({
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
    })[]>;
    getEvent(userId: string, eventId: string): Promise<{
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
    }>;
    createEvent(userId: string, dto: CreateEventDto): Promise<{
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
    updateEvent(userId: string, eventId: string, dto: UpdateEventDto): Promise<{
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
    submitForApproval(userId: string, eventId: string): Promise<{
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
    publishEvent(userId: string, eventId: string): Promise<{
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
    cancelEvent(userId: string, eventId: string): Promise<{
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
    getEventAttendees(userId: string, eventId: string): Promise<{
        stats: {
            total: number;
            valid: number;
            used: number;
            cancelled: number;
        };
        attendees: ({
            user: {
                id: string;
                phone: string;
                email: string | null;
                name: string | null;
            };
            ticketType: {
                name: string;
                price: number;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.TicketStatus;
            createdAt: Date;
            userId: string;
            eventId: string;
            qrCode: string;
            usedAt: Date | null;
            orderId: string | null;
            ticketTypeId: string;
        })[];
    }>;
    addTicketType(userId: string, eventId: string, dto: CreateTicketTypeDto): Promise<{
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
    }>;
    updateTicketType(userId: string, eventId: string, ticketTypeId: string, dto: Partial<CreateTicketTypeDto>): Promise<{
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
    }>;
    deleteTicketType(userId: string, eventId: string, ticketTypeId: string): Promise<{
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
    }>;
}
