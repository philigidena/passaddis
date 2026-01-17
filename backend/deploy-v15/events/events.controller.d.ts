import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/events.dto';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    findAll(query: EventQueryDto): Promise<{
        data: {
            ticketTypes: {
                available: number;
                id: string;
                name: string;
                price: number;
                quantity: number;
                sold: number;
            }[];
            minPrice: number;
            maxPrice: number;
            ticketsAvailable: number;
            organizer: {
                id: string;
                businessName: string;
                logo: string | null;
            } | null;
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
    getFeatured(): Promise<{
        ticketTypes: {
            available: number;
            price: number;
            quantity: number;
            sold: number;
        }[];
        minPrice: number;
        maxPrice: number;
        ticketsAvailable: number;
        organizer: {
            id: string;
            businessName: string;
        } | null;
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
    }[]>;
    getCategories(): Promise<{
        category: import(".prisma/client").$Enums.EventCategory;
        count: number;
    }[]>;
    findOne(id: string): Promise<{
        ticketTypes: {
            available: number;
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
        minPrice: number;
        maxPrice: number;
        ticketsAvailable: number;
        organizer: {
            id: string;
            description: string | null;
            businessName: string;
            logo: string | null;
        } | null;
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
    create(organizerId: string, dto: CreateEventDto): Promise<{
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
    update(id: string, organizerId: string, dto: UpdateEventDto): Promise<{
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
    getMyEvents(organizerId: string): Promise<({
        ticketTypes: {
            id: string;
            name: string;
            price: number;
            quantity: number;
            sold: number;
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
    })[]>;
}
