import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/events.dto';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: EventQueryDto): Promise<{
        data: {
            minPrice: number;
            maxPrice: number;
            ticketsAvailable: number;
            organizer: {
                id: string;
                businessName: string;
                logo: string | null;
            } | null;
            ticketTypes: {
                id: string;
                name: string;
                price: number;
                quantity: number;
                sold: number;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            title: string;
            imageUrl: string | null;
            venue: string;
            address: string | null;
            city: string;
            date: Date;
            endDate: Date | null;
            category: import(".prisma/client").$Enums.EventCategory;
            status: import(".prisma/client").$Enums.EventStatus;
            isFeatured: boolean;
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
        minPrice: number;
        maxPrice: number;
        organizer: {
            id: string;
            businessName: string;
        } | null;
        ticketTypes: {
            price: number;
            quantity: number;
            sold: number;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        imageUrl: string | null;
        venue: string;
        address: string | null;
        city: string;
        date: Date;
        endDate: Date | null;
        category: import(".prisma/client").$Enums.EventCategory;
        status: import(".prisma/client").$Enums.EventStatus;
        isFeatured: boolean;
        organizerId: string | null;
        merchantId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        minPrice: number;
        maxPrice: number;
        ticketsAvailable: number;
        organizer: {
            id: string;
            businessName: string;
            description: string | null;
            logo: string | null;
        } | null;
        ticketTypes: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            quantity: number;
            sold: number;
            maxPerOrder: number;
            eventId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        imageUrl: string | null;
        venue: string;
        address: string | null;
        city: string;
        date: Date;
        endDate: Date | null;
        category: import(".prisma/client").$Enums.EventCategory;
        status: import(".prisma/client").$Enums.EventStatus;
        isFeatured: boolean;
        organizerId: string | null;
        merchantId: string | null;
    }>;
    create(organizerId: string, dto: CreateEventDto): Promise<{
        ticketTypes: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            quantity: number;
            sold: number;
            maxPerOrder: number;
            eventId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        imageUrl: string | null;
        venue: string;
        address: string | null;
        city: string;
        date: Date;
        endDate: Date | null;
        category: import(".prisma/client").$Enums.EventCategory;
        status: import(".prisma/client").$Enums.EventStatus;
        isFeatured: boolean;
        organizerId: string | null;
        merchantId: string | null;
    }>;
    update(id: string, organizerId: string, dto: UpdateEventDto): Promise<{
        ticketTypes: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            quantity: number;
            sold: number;
            maxPerOrder: number;
            eventId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        imageUrl: string | null;
        venue: string;
        address: string | null;
        city: string;
        date: Date;
        endDate: Date | null;
        category: import(".prisma/client").$Enums.EventCategory;
        status: import(".prisma/client").$Enums.EventStatus;
        isFeatured: boolean;
        organizerId: string | null;
        merchantId: string | null;
    }>;
    getOrganizerEvents(organizerId: string): Promise<({
        ticketTypes: {
            id: string;
            name: string;
            price: number;
            quantity: number;
            sold: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        title: string;
        imageUrl: string | null;
        venue: string;
        address: string | null;
        city: string;
        date: Date;
        endDate: Date | null;
        category: import(".prisma/client").$Enums.EventCategory;
        status: import(".prisma/client").$Enums.EventStatus;
        isFeatured: boolean;
        organizerId: string | null;
        merchantId: string | null;
    })[]>;
    getCategories(): Promise<{
        category: import(".prisma/client").$Enums.EventCategory;
        count: number;
    }[]>;
}
