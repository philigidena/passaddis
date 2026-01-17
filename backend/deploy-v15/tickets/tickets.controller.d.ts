import { TicketsService } from './tickets.service';
import { PurchaseTicketsDto, ValidateTicketDto } from './dto/tickets.dto';
export declare class TicketsController {
    private ticketsService;
    constructor(ticketsService: TicketsService);
    purchaseTickets(userId: string, dto: PurchaseTicketsDto): Promise<{
        order: {
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
        };
        tickets: {
            id: string;
            status: import(".prisma/client").$Enums.TicketStatus;
            createdAt: Date;
            userId: string;
            eventId: string;
            qrCode: string;
            usedAt: Date | null;
            orderId: string | null;
            ticketTypeId: string;
        }[];
        paymentRequired: number;
    }>;
    getMyTickets(userId: string): Promise<({
        event: {
            id: string;
            title: string;
            imageUrl: string | null;
            venue: string;
            date: Date;
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
    })[]>;
    getTicket(userId: string, ticketId: string): Promise<{
        qrCodeImage: string;
        event: {
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
        };
        ticketType: {
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
        };
        id: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        createdAt: Date;
        userId: string;
        eventId: string;
        qrCode: string;
        usedAt: Date | null;
        orderId: string | null;
        ticketTypeId: string;
    }>;
    validateTicket(dto: ValidateTicketDto): Promise<{
        valid: boolean;
        message: string;
        usedAt?: undefined;
        ticket?: undefined;
    } | {
        valid: boolean;
        message: string;
        usedAt: Date | null;
        ticket?: undefined;
    } | {
        valid: boolean;
        message: string;
        ticket: {
            id: string;
            event: string;
            ticketType: string;
            attendee: string;
        };
        usedAt?: undefined;
    }>;
}
