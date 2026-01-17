import { ConfigService } from '@nestjs/config';
export interface TelebirrPaymentRequest {
    amount: number;
    orderId: string;
    subject: string;
    notifyUrl: string;
    returnUrl: string;
}
export interface TelebirrPaymentResponse {
    success: boolean;
    paymentUrl?: string;
    outTradeNo?: string;
    error?: string;
}
export declare class TelebirrProvider {
    private configService;
    private readonly appId;
    private readonly appKey;
    private readonly publicKey;
    private readonly shortCode;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    initiatePayment(request: TelebirrPaymentRequest): Promise<TelebirrPaymentResponse>;
    verifyCallback(data: any): Promise<boolean>;
    checkStatus(outTradeNo: string): Promise<any>;
}
