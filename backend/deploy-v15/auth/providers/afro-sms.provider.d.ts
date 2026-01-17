import { ConfigService } from '@nestjs/config';
export interface SmsResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare class AfroSmsProvider {
    private configService;
    private readonly apiKey;
    private readonly identifier;
    private readonly senderId;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    sendSms(phone: string, message: string): Promise<SmsResponse>;
    sendOtp(phone: string, code: string): Promise<SmsResponse>;
    sendTicketConfirmation(phone: string, eventName: string, ticketCode: string): Promise<SmsResponse>;
    sendOrderConfirmation(phone: string, orderId: string, pickupCode: string): Promise<SmsResponse>;
    private formatPhone;
}
