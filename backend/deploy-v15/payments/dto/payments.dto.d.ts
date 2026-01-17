export declare enum PaymentMethod {
    CHAPA = "CHAPA",
    TELEBIRR = "TELEBIRR",
    CBE_BIRR = "CBE_BIRR",
    BANK_TRANSFER = "BANK_TRANSFER"
}
export declare class InitiatePaymentDto {
    orderId: string;
    method: PaymentMethod;
}
export declare class PaymentCallbackDto {
    orderId: string;
    transactionId: string;
    status: string;
}
export declare class TelebirrCallbackDto {
    outTradeNo: string;
    transactionNo: string;
    totalAmount: string;
    tradeStatus: string;
    msisdn: string;
}
export declare class CbeBirrCallbackDto {
    merchantId: string;
    referenceId: string;
    amount: string;
    status: string;
    transactionId: string;
}
export declare class ChapaWebhookDto {
    event: string;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
    charge: number;
    payment_method: string;
    reference: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    created_at: string;
}
