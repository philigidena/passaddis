"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
const QRCode = __importStar(require("qrcode"));
let ShopService = class ShopService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getItems(query) {
        const where = { inStock: true };
        if (query.category) {
            where.category = query.category;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.shopItem.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async getPickupLocations() {
        return this.prisma.pickupLocation.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async createOrder(userId, dto) {
        const { items, pickupLocationId } = dto;
        const pickupLocation = await this.prisma.pickupLocation.findUnique({
            where: { id: pickupLocationId },
        });
        if (!pickupLocation || !pickupLocation.isActive) {
            throw new common_1.NotFoundException('Pickup location not found');
        }
        let subtotal = 0;
        const orderItems = [];
        for (const item of items) {
            const shopItem = await this.prisma.shopItem.findUnique({
                where: { id: item.shopItemId },
            });
            if (!shopItem) {
                throw new common_1.NotFoundException(`Item ${item.shopItemId} not found`);
            }
            if (!shopItem.inStock) {
                throw new common_1.BadRequestException(`${shopItem.name} is out of stock`);
            }
            subtotal += shopItem.price * item.quantity;
            orderItems.push({
                shopItemId: shopItem.id,
                quantity: item.quantity,
                price: shopItem.price,
            });
        }
        const serviceFee = 0;
        const total = subtotal + serviceFee;
        const orderNumber = `PS${Date.now().toString(36).toUpperCase()}`;
        const qrCode = `PS-${(0, uuid_1.v4)().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
        const order = await this.prisma.order.create({
            data: {
                orderNumber,
                userId,
                pickupLocationId,
                subtotal,
                serviceFee,
                total,
                qrCode,
                status: 'PENDING',
                items: {
                    create: orderItems.map((item) => ({
                        shopItemId: item.shopItemId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        shopItem: true,
                    },
                },
                pickupLocation: true,
            },
        });
        return {
            order,
            paymentRequired: total,
        };
    }
    async getUserOrders(userId) {
        return this.prisma.order.findMany({
            where: {
                userId,
                items: { some: {} },
            },
            include: {
                items: {
                    include: {
                        shopItem: {
                            select: {
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                pickupLocation: {
                    select: {
                        name: true,
                        area: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOrder(userId, orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        shopItem: true,
                    },
                },
                pickupLocation: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.NotFoundException('Order not found');
        }
        let qrCodeImage = null;
        if (order.qrCode && order.status !== 'COMPLETED') {
            qrCodeImage = await QRCode.toDataURL(order.qrCode, {
                width: 300,
                margin: 2,
            });
        }
        return {
            ...order,
            qrCodeImage,
        };
    }
    async validatePickup(dto) {
        const order = await this.prisma.order.findUnique({
            where: { qrCode: dto.qrCode },
            include: {
                items: {
                    include: {
                        shopItem: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                pickupLocation: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
            },
        });
        if (!order) {
            return {
                valid: false,
                message: 'Order not found',
            };
        }
        if (order.status === 'COMPLETED') {
            return {
                valid: false,
                message: 'Order already picked up',
                pickedUpAt: order.pickedUpAt,
            };
        }
        if (order.status !== 'PAID' && order.status !== 'READY_FOR_PICKUP') {
            return {
                valid: false,
                message: 'Order not ready for pickup',
                status: order.status,
            };
        }
        await this.prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'COMPLETED',
                pickedUpAt: new Date(),
            },
        });
        return {
            valid: true,
            message: 'Order pickup confirmed',
            order: {
                orderNumber: order.orderNumber,
                items: order.items.map((i) => ({
                    name: i.shopItem.name,
                    quantity: i.quantity,
                })),
                customer: order.user.name || order.user.phone,
                pickupLocation: order.pickupLocation?.name,
            },
        };
    }
};
exports.ShopService = ShopService;
exports.ShopService = ShopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShopService);
//# sourceMappingURL=shop.service.js.map