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
exports.ShopOwnerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ShopOwnerService = class ShopOwnerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        phone: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });
        return merchant;
    }
    async createProfile(userId, dto) {
        const existing = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (existing) {
            throw new common_1.ConflictException('Shop owner profile already exists');
        }
        const count = await this.prisma.merchant.count();
        const merchantCode = `PS${String(count + 1).padStart(4, '0')}`;
        const merchant = await this.prisma.merchant.create({
            data: {
                merchantCode,
                businessName: dto.businessName,
                tradeName: dto.tradeName,
                description: dto.description,
                logo: dto.logo,
                type: 'SHOP',
                status: 'PENDING',
                tinNumber: dto.tinNumber,
                licenseNumber: dto.licenseNumber,
                businessAddress: dto.businessAddress,
                city: dto.city || 'Addis Ababa',
                bankName: dto.bankName,
                bankAccount: dto.bankAccount,
                telebirrAccount: dto.telebirrAccount,
                userId,
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'SHOP_OWNER' },
        });
        return merchant;
    }
    async updateProfile(userId, dto) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Shop owner profile not found');
        }
        return this.prisma.merchant.update({
            where: { userId },
            data: dto,
        });
    }
    async getDashboard(userId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Shop owner profile not found. Please create one first.');
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const orderStats = await this.prisma.order.groupBy({
            by: ['status'],
            where: {
                items: { some: {} },
            },
            _count: true,
        });
        const totalRevenue = await this.prisma.order.aggregate({
            where: {
                status: { in: ['PAID', 'COMPLETED', 'READY_FOR_PICKUP'] },
                items: { some: {} },
            },
            _sum: { total: true },
        });
        const monthlyRevenue = await this.prisma.order.aggregate({
            where: {
                status: { in: ['PAID', 'COMPLETED', 'READY_FOR_PICKUP'] },
                items: { some: {} },
                createdAt: { gte: startOfMonth },
            },
            _sum: { total: true },
        });
        const weeklyRevenue = await this.prisma.order.aggregate({
            where: {
                status: { in: ['PAID', 'COMPLETED', 'READY_FOR_PICKUP'] },
                items: { some: {} },
                createdAt: { gte: startOfWeek },
            },
            _sum: { total: true },
        });
        const topItems = await this.prisma.orderItem.groupBy({
            by: ['shopItemId'],
            _sum: { quantity: true, price: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });
        const itemIds = topItems.map((i) => i.shopItemId);
        const items = await this.prisma.shopItem.findMany({
            where: { id: { in: itemIds } },
        });
        const topItemsWithDetails = topItems.map((ti) => {
            const item = items.find((i) => i.id === ti.shopItemId);
            return {
                id: ti.shopItemId,
                name: item?.name || 'Unknown',
                soldCount: ti._sum.quantity || 0,
                revenue: (ti._sum.price || 0) * (ti._sum.quantity || 0),
            };
        });
        const walletBalance = await this.prisma.walletTransaction.aggregate({
            where: { merchantId: merchant.id },
            _sum: { netAmount: true },
        });
        const statusCounts = orderStats.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = item._count;
            return acc;
        }, {
            pending: 0,
            paid: 0,
            ready_for_pickup: 0,
            completed: 0,
            cancelled: 0,
        });
        return {
            profile: {
                id: merchant.id,
                businessName: merchant.businessName,
                status: merchant.status,
                isVerified: merchant.isVerified,
                commissionRate: merchant.commissionRate,
            },
            orders: {
                total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
                pending: statusCounts.pending + statusCounts.paid,
                ready: statusCounts.ready_for_pickup,
                completed: statusCounts.completed,
                cancelled: statusCounts.cancelled,
            },
            revenue: {
                total: totalRevenue._sum.total || 0,
                thisMonth: monthlyRevenue._sum.total || 0,
                thisWeek: weeklyRevenue._sum.total || 0,
            },
            wallet: {
                balance: walletBalance._sum.netAmount || 0,
                pendingSettlement: 0,
            },
            topItems: topItemsWithDetails,
        };
    }
    async getOrders(userId, status) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Shop owner profile not found');
        }
        const where = {
            items: { some: {} },
        };
        if (status) {
            where.status = status;
        }
        return this.prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        shopItem: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                category: true,
                            },
                        },
                    },
                },
                pickupLocation: {
                    select: {
                        id: true,
                        name: true,
                        area: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOrder(userId, orderId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Shop owner profile not found');
        }
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        shopItem: true,
                    },
                },
                pickupLocation: true,
                payment: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateOrderStatus(userId, orderId, status) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Shop owner profile not found');
        }
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const validTransitions = {
            PAID: ['READY_FOR_PICKUP'],
            READY_FOR_PICKUP: ['COMPLETED'],
        };
        if (!validTransitions[order.status]?.includes(status)) {
            throw new common_1.BadRequestException(`Cannot change order status from ${order.status} to ${status}`);
        }
        const updateData = { status };
        if (status === 'COMPLETED') {
            updateData.pickedUpAt = new Date();
        }
        return this.prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                user: {
                    select: { name: true, phone: true },
                },
                items: {
                    include: {
                        shopItem: {
                            select: { name: true },
                        },
                    },
                },
            },
        });
    }
    async validatePickup(userId, qrCode) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Shop owner profile not found');
        }
        const order = await this.prisma.order.findUnique({
            where: { qrCode },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        shopItem: {
                            select: {
                                name: true,
                                category: true,
                            },
                        },
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
        if (order.status === 'CANCELLED') {
            return {
                valid: false,
                message: 'Order has been cancelled',
            };
        }
        if (order.status !== 'READY_FOR_PICKUP' && order.status !== 'PAID') {
            return {
                valid: false,
                message: `Order is not ready for pickup. Status: ${order.status}`,
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
            message: 'Order validated successfully',
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                customer: order.user.name || order.user.phone,
                items: order.items.map((i) => ({
                    name: i.shopItem.name,
                    quantity: i.quantity,
                })),
                total: order.total,
            },
        };
    }
    async getSalesAnalytics(userId, period) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Shop owner profile not found');
        }
        const now = new Date();
        let startDate;
        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: { gte: startDate },
                status: { in: ['PAID', 'COMPLETED', 'READY_FOR_PICKUP'] },
                items: { some: {} },
            },
            include: {
                items: true,
            },
        });
        const salesByDay = {};
        orders.forEach((order) => {
            const dateKey = order.createdAt.toISOString().split('T')[0];
            if (!salesByDay[dateKey]) {
                salesByDay[dateKey] = { orders: 0, revenue: 0 };
            }
            salesByDay[dateKey].orders += 1;
            salesByDay[dateKey].revenue += order.total;
        });
        return {
            period,
            startDate,
            endDate: now,
            summary: {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
                avgOrderValue: orders.length > 0
                    ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length
                    : 0,
            },
            dailyBreakdown: Object.entries(salesByDay).map(([date, data]) => ({
                date,
                ...data,
            })),
        };
    }
};
exports.ShopOwnerService = ShopOwnerService;
exports.ShopOwnerService = ShopOwnerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShopOwnerService);
//# sourceMappingURL=shop-owner.service.js.map