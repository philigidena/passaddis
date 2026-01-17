export declare class CreateOrganizerProfileDto {
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
export declare class UpdateOrganizerProfileDto {
    businessName?: string;
    tradeName?: string;
    description?: string;
    logo?: string;
    businessAddress?: string;
    city?: string;
    bankName?: string;
    bankAccount?: string;
    telebirrAccount?: string;
}
export declare class CreateTicketTypeDto {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    maxPerOrder?: number;
}
export declare class CreateEventDto {
    title: string;
    description: string;
    imageUrl?: string;
    venue: string;
    address?: string;
    city?: string;
    date: string;
    endDate?: string;
    category: string;
    ticketTypes: CreateTicketTypeDto[];
}
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    imageUrl?: string;
    venue?: string;
    address?: string;
    city?: string;
    date?: string;
    endDate?: string;
    category?: string;
}
export interface OrganizerDashboardStats {
    events: {
        total: number;
        draft: number;
        pending: number;
        approved: number;
        published: number;
        rejected: number;
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
}
