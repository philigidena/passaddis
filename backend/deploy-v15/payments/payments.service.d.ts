import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ChapaProvider } from './providers/chapa.provider';
import { TelebirrProvider } from './providers/telebirr.provider';
import { CbeBirrProvider } from './providers/cbe-birr.provider';
import { InitiatePaymentDto, PaymentMethod, TelebirrCallbackDto, CbeBirrCallbackDto, ChapaWebhookDto } from './dto/payments.dto';
export declare class PaymentsService {
    private prisma;
    private configService;
    private chapaProvider;
    private telebirrProvider;
    private cbeBirrProvider;
    private readonly frontendUrl;
    private readonly apiUrl;
    constructor(prisma: PrismaService, configService: ConfigService, chapaProvider: ChapaProvider, telebirrProvider: TelebirrProvider, cbeBirrProvider: CbeBirrProvider);
    initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<{
        success: boolean;
        checkout_url?: string;
        tx_ref?: string;
        error?: string;
        paymentId: string;
        orderId: string;
        amount: number;
        method: PaymentMethod.CHAPA | PaymentMethod.TELEBIRR | PaymentMethod.CBE_BIRR;
    } | {
        success: boolean;
        paymentUrl?: string;
        outTradeNo?: string;
        error?: string;
        paymentId: string;
        orderId: string;
        amount: number;
        method: PaymentMethod.CHAPA | PaymentMethod.TELEBIRR | PaymentMethod.CBE_BIRR;
    } | {
        success: boolean;
        paymentUrl?: string;
        referenceId?: string;
        error?: string;
        paymentId: string;
        orderId: string;
        amount: number;
        method: PaymentMethod.CHAPA | PaymentMethod.TELEBIRR | PaymentMethod.CBE_BIRR;
    }>;
    handleTelebirrCallback(data: TelebirrCallbackDto): Promise<{
        success: boolean;
    }>;
    handleCbeBirrCallback(data: CbeBirrCallbackDto): Promise<{
        success: boolean;
    }>;
    handleChapaWebhook(data: ChapaWebhookDto, signature?: string): Promise<{
        success: boolean;
    }>;
    verifyChapaPayment(userId: string, orderId: string): Promise<{
        verified: boolean;
        status: string;
        order: {
            id: string;
            status: string;
        };
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
}
