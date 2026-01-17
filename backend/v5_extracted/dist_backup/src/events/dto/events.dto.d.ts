export declare enum EventCategory {
    MUSIC = "MUSIC",
    SPORTS = "SPORTS",
    ARTS = "ARTS",
    COMEDY = "COMEDY",
    FESTIVAL = "FESTIVAL",
    CONFERENCE = "CONFERENCE",
    NIGHTLIFE = "NIGHTLIFE",
    OTHER = "OTHER"
}
export declare enum EventStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
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
    category: EventCategory;
    ticketTypes: CreateTicketTypeDto[];
}
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    imageUrl?: string;
    venue?: string;
    address?: string;
    date?: string;
    endDate?: string;
    category?: EventCategory;
    status?: EventStatus;
    isFeatured?: boolean;
}
export declare class EventQueryDto {
    search?: string;
    category?: EventCategory;
    city?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
}
