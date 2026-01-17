import { ConfigService } from '@nestjs/config';
export interface CbeBirrPaymentRequest {
    amount: number;
    orderId: string;
    description: string;
    notifyUrl: string;
    returnUrl: string;
}
export interface CbeBirrPaymentResponse {
    success: boolean;
    paymentUrl?: string;
    referenceId?: string;
    error?: string;
}
export declare class CbeBirrProvider {
    private configService;
    private readonly merchantId;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    initiatePayment(request: CbeBirrPaymentRequest): Promise<CbeBirrPaymentResponse>;
    verifyCallback(data: any): Promise<boolean>;
    checkStatus(referenceId: string): Promise<any>;
}
