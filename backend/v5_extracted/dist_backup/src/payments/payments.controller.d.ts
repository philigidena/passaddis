import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, TelebirrCallbackDto, CbeBirrCallbackDto, ChapaWebhookDto } from './dto/payments.dto';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<{
        success: boolean;
        checkout_url?: string;
        tx_ref?: string;
        error?: string;
        paymentId: string;
        orderId: string;
        amount: number;
        method: import("./dto/payments.dto").PaymentMethod.CHAPA | import("./dto/payments.dto").PaymentMethod.TELEBIRR | import("./dto/payments.dto").PaymentMethod.CBE_BIRR;
    } | {
        success: boolean;
        paymentUrl?: string;
        outTradeNo?: string;
        error?: string;
        paymentId: string;
        orderId: string;
        amount: number;
        method: import("./dto/payments.dto").PaymentMethod.CHAPA | import("./dto/payments.dto").PaymentMethod.TELEBIRR | import("./dto/payments.dto").PaymentMethod.CBE_BIRR;
    } | {
        success: boolean;
        paymentUrl?: string;
        referenceId?: string;
        error?: string;
        paymentId: string;
        orderId: string;
        amount: number;
        method: import("./dto/payments.dto").PaymentMethod.CHAPA | import("./dto/payments.dto").PaymentMethod.TELEBIRR | import("./dto/payments.dto").PaymentMethod.CBE_BIRR;
    }>;
    getPaymentStatus(userId: string, orderId: string): Promise<{
        orderId: string;
        orderStatus: import(".prisma/client").$Enums.OrderStatus;
        payment: {
            id: string;
            amount: number;
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
        } | null;
    }>;
    telebirrCallback(data: TelebirrCallbackDto): Promise<{
        success: boolean;
    }>;
    cbeBirrCallback(data: CbeBirrCallbackDto): Promise<{
        success: boolean;
    }>;
    chapaCallback(data: ChapaWebhookDto, signature?: string): Promise<{
        success: boolean;
    }>;
    verifyPayment(userId: string, orderId: string): Promise<{
        verified: boolean;
        status: string;
        order: {
            id: string;
            status: string;
        };
    }>;
}
