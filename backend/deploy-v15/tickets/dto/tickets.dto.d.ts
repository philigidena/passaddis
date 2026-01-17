export declare class TicketPurchaseItemDto {
    ticketTypeId: string;
    quantity: number;
}
export declare class PurchaseTicketsDto {
    eventId: string;
    tickets: TicketPurchaseItemDto[];
}
export declare class ValidateTicketDto {
    qrCode: string;
}
