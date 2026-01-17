"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const chapa_provider_1 = require("./providers/chapa.provider");
const telebirr_provider_1 = require("./providers/telebirr.provider");
const cbe_birr_provider_1 = require("./providers/cbe-birr.provider");
const payments_dto_1 = require("./dto/payments.dto");
let PaymentsService = class PaymentsService {
    prisma;
    configService;
    chapaProvider;
    telebirrProvider;
    cbeBirrProvider;
    frontendUrl;
    apiUrl;
    constructor(prisma, configService, chapaProvider, telebirrProvider, cbeBirrProvider) {
        this.prisma = prisma;
        this.configService = configService;
        this.chapaProvider = chapaProvider;
        this.telebirrProvider = telebirrProvider;
        this.cbeBirrProvider = cbeBirrProvider;
        this.frontendUrl =
            this.configService.get('FRONTEND_URL') || 'http://localhost:8081';
        this.apiUrl = this.configService.get('API_URL') || `http://localhost:${this.configService.get('PORT') || 3000}`;
    }
    async initiatePayment(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: {
                tickets: {
                    include: {
                        event: { select: { title: true } },
                    },
                },
                items: {
                    include: {
                        shopItem: { select: { name: true } },
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status !== 'PENDING') {
            throw new common_1.BadRequestException('Order is not pending payment');
        }
        const existingPayment = await this.prisma.payment.findUnique({
            where: { orderId: order.id },
        });
        if (existingPayment && existingPayment.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Order already paid');
        }
        let description = 'PassAddis Order';
        if (order.tickets.length > 0) {
            const eventTitle = order.tickets[0].event.title.replace(/[^a-zA-Z0-9\-_\s.]/g, '');
            description = `Tickets for ${eventTitle}`;
        }
        else if (order.items.length > 0) {
            const itemNames = order.items.map((i) => i.shopItem.name.replace(/[^a-zA-Z0-9\-_\s.]/g, '')).join(' and ');
            description = `Shop order ${itemNames}`;
        }
        const payment = await this.prisma.payment.upsert({
            where: { orderId: order.id },
            create: {
                orderId: order.id,
                amount: order.total,
                method: dto.method,
                status: 'PENDING',
            },
            update: {
                method: dto.method,
                status: 'PENDING',
            },
        });
        const notifyUrl = `${this.apiUrl}/api/payments/callback/${dto.method.toLowerCase()}`;
        const returnUrl = `${this.frontendUrl}/orders/${order.id}`;
        let result;
        if (dto.method === payments_dto_1.PaymentMethod.CHAPA) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { phone: true, email: true },
            });
            result = await this.chapaProvider.initiatePayment({
                amount: order.total,
                currency: 'ETB',
                phone: user?.phone || '',
                email: user?.email || undefined,
                tx_ref: payment.id,
                callback_url: `${this.apiUrl}/api/payments/callback/chapa`,
                return_url: `${this.frontendUrl}/orders/${order.id}`,
                customization: {
                    title: 'PassAddis Pay',
                    description: description,
                },
            });
            if (result.success && result.tx_ref) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        providerRef: result.tx_ref,
                        status: 'PROCESSING',
                    },
                });
            }
        }
        else if (dto.method === payments_dto_1.PaymentMethod.TELEBIRR) {
            result = await this.telebirrProvider.initiatePayment({
                amount: order.total,
                orderId: order.id,
                subject: description,
                notifyUrl,
                returnUrl,
            });
            if (result.success && result.outTradeNo) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        providerRef: result.outTradeNo,
                        status: 'PROCESSING',
                    },
                });
            }
        }
        else if (dto.method === payments_dto_1.PaymentMethod.CBE_BIRR) {
            result = await this.cbeBirrProvider.initiatePayment({
                amount: order.total,
                orderId: order.id,
                description,
                notifyUrl,
                returnUrl,
            });
            if (result.success && result.referenceId) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        providerRef: result.referenceId,
                        status: 'PROCESSING',
                    },
                });
            }
        }
        else {
            throw new common_1.BadRequestException('Unsupported payment method');
        }
        return {
            paymentId: payment.id,
            orderId: order.id,
            amount: order.total,
            method: dto.method,
            ...result,
        };
    }
    async handleTelebirrCallback(data) {
        const verified = await this.telebirrProvider.verifyCallback(data);
        if (!verified) {
            console.error('Telebirr callback verification failed');
            return { success: false };
        }
        const payment = await this.prisma.payment.findFirst({
            where: { providerRef: data.outTradeNo },
        });
        if (!payment) {
            console.error('Payment not found for Telebirr callback:', data.outTradeNo);
            return { success: false };
        }
        const isSuccess = data.tradeStatus === 'SUCCESS' || data.tradeStatus === '2';
        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: isSuccess ? 'COMPLETED' : 'FAILED',
                    providerData: data,
                },
            }),
            this.prisma.order.update({
                where: { id: payment.orderId },
                data: {
                    status: isSuccess ? 'PAID' : 'PENDING',
                    paymentMethod: 'TELEBIRR',
                    paymentRef: data.transactionNo,
                },
            }),
        ]);
        return { success: true };
    }
    async handleCbeBirrCallback(data) {
        const verified = await this.cbeBirrProvider.verifyCallback(data);
        if (!verified) {
            console.error('CBE Birr callback verification failed');
            return { success: false };
        }
        const payment = await this.prisma.payment.findFirst({
            where: { providerRef: data.referenceId },
        });
        if (!payment) {
            console.error('Payment not found for CBE callback:', data.referenceId);
            return { success: false };
        }
        const isSuccess = data.status === 'SUCCESS' || data.status === 'COMPLETED';
        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: isSuccess ? 'COMPLETED' : 'FAILED',
                    providerData: data,
                },
            }),
            this.prisma.order.update({
                where: { id: payment.orderId },
                data: {
                    status: isSuccess ? 'PAID' : 'PENDING',
                    paymentMethod: 'CBE_BIRR',
                    paymentRef: data.transactionId,
                },
            }),
        ]);
        return { success: true };
    }
    async handleChapaWebhook(data, signature) {
        if (signature) {
            const isValid = this.chapaProvider.verifyWebhook(signature, JSON.stringify(data));
            if (!isValid) {
                console.error('Chapa webhook signature verification failed');
                return { success: false };
            }
        }
        const payment = await this.prisma.payment.findUnique({
            where: { id: data.tx_ref },
        });
        if (!payment) {
            console.error('Payment not found for Chapa webhook:', data.tx_ref);
            return { success: false };
        }
        const isSuccess = data.status === 'success';
        let paymentMethod = 'CHAPA';
        if (data.payment_method) {
            const method = data.payment_method.toLowerCase();
            if (method.includes('telebirr')) {
                paymentMethod = 'TELEBIRR';
            }
            else if (method.includes('cbe')) {
                paymentMethod = 'CBE_BIRR';
            }
        }
        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: isSuccess ? 'COMPLETED' : 'FAILED',
                    providerRef: data.reference,
                    providerData: data,
                },
            }),
            this.prisma.order.update({
                where: { id: payment.orderId },
                data: {
                    status: isSuccess ? 'PAID' : 'PENDING',
                    paymentMethod: paymentMethod,
                    paymentRef: data.reference,
                },
            }),
        ]);
        console.log(`Chapa payment ${isSuccess ? 'succeeded' : 'failed'}: ${data.tx_ref}`);
        return { success: true };
    }
    async verifyChapaPayment(userId, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (!order.payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        const verification = await this.chapaProvider.verifyPayment(order.payment.id);
        if (verification.status === 'success' && verification.data?.status === 'success') {
            if (order.payment.status !== 'COMPLETED') {
                await this.prisma.$transaction([
                    this.prisma.payment.update({
                        where: { id: order.payment.id },
                        data: {
                            status: 'COMPLETED',
                            providerRef: verification.data.reference,
                            providerData: verification.data,
                        },
                    }),
                    this.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            status: 'PAID',
                            paymentRef: verification.data.reference,
                        },
                    }),
                ]);
            }
            return {
                verified: true,
                status: 'COMPLETED',
                order: {
                    id: order.id,
                    status: 'PAID',
                },
            };
        }
        return {
            verified: false,
            status: order.payment.status,
            order: {
                id: order.id,
                status: order.status,
            },
        };
    }
    async getPaymentStatus(userId, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found');
        }
        return {
            orderId: order.id,
            orderStatus: order.status,
            payment: order.payment
                ? {
                    id: order.payment.id,
                    amount: order.payment.amount,
                    method: order.payment.method,
                    status: order.payment.status,
                }
                : null,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        chapa_provider_1.ChapaProvider,
        telebirr_provider_1.TelebirrProvider,
        cbe_birr_provider_1.CbeBirrProvider])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map