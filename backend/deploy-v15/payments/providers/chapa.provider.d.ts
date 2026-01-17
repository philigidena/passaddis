import { ConfigService } from '@nestjs/config';
export interface ChapaPaymentRequest {
    amount: number;
    currency: string;
    email?: string;
    phone: string;
    tx_ref: string;
    callback_url: string;
    return_url: string;
    customization?: {
        title?: string;
        description?: string;
        logo?: string;
    };
}
export interface ChapaPaymentResponse {
    success: boolean;
    checkout_url?: string;
    tx_ref?: string;
    error?: string;
}
export interface ChapaWebhookPayload {
    event: string;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
    charge: number;
    payment_method: string;
    reference: string;
    created_at: string;
}
export declare class ChapaProvider {
    private configService;
    private readonly secretKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    initiatePayment(request: ChapaPaymentRequest): Promise<ChapaPaymentResponse>;
    verifyPayment(tx_ref: string): Promise<any>;
    verifyWebhook(signature: string, payload: string): boolean;
}
