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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalUsers, newUsersThisMonth, usersByRole, totalEvents, pendingEvents, publishedEvents, eventsThisMonth, ticketStats, orderStats,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            this.prisma.event.count(),
            this.prisma.event.count({ where: { status: 'PENDING' } }),
            this.prisma.event.count({ where: { status: 'PUBLISHED' } }),
            this.prisma.event.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
            this.prisma.ticket.aggregate({
                _count: true,
            }),
            this.prisma.order.aggregate({
                _count: true,
                _sum: { total: true },
                where: { status: 'COMPLETED' },
            }),
        ]);
        const ticketRevenue = await this.prisma.order.aggregate({
            _sum: { total: true },
            where: {
                status: { in: ['PAID', 'COMPLETED'] },
                tickets: { some: {} },
            },
        });
        const monthlyTickets = await this.prisma.ticket.count({
            where: { createdAt: { gte: startOfMonth } },
        });
        const monthlyRevenue = await this.prisma.order.aggregate({
            _sum: { total: true },
            where: {
                status: { in: ['PAID', 'COMPLETED'] },
                createdAt: { gte: startOfMonth },
            },
        });
        return {
            users: {
                total: totalUsers,
                newThisMonth: newUsersThisMonth,
                byRole: usersByRole.reduce((acc, item) => {
                    acc[item.role] = item._count;
                    return acc;
                }, {}),
            },
            events: {
                total: totalEvents,
                pending: pendingEvents,
                published: publishedEvents,
                thisMonth: eventsThisMonth,
            },
            tickets: {
                totalSold: ticketStats._count,
                revenue: ticketRevenue._sum.total || 0,
                thisMonth: {
                    sold: monthlyTickets,
                    revenue: monthlyRevenue._sum.total || 0,
                },
            },
            orders: {
                total: orderStats._count,
                pending: await this.prisma.order.count({ where: { status: 'PENDING' } }),
                completed: orderStats._count,
                revenue: orderStats._sum.total || 0,
            },
        };
    }
    async getUsers(query) {
        const { search, role, page = 1, limit = 20 } = query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }
        if (role) {
            where.role = role;
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    phone: true,
                    email: true,
                    name: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                    _count: {
                        select: {
                            tickets: true,
                            orders: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                organizer: true,
                merchant: true,
                _count: {
                    select: {
                        tickets: true,
                        orders: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateUserRole(id, dto, adminId) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (id === adminId) {
            throw new common_1.BadRequestException('Cannot change your own role');
        }
        return this.prisma.user.update({
            where: { id },
            data: { role: dto.role },
            select: {
                id: true,
                phone: true,
                email: true,
                name: true,
                role: true,
            },
        });
    }
    async getPendingEvents(query) {
        const { status, search, page = 1, limit = 20 } = query;
        const where = {};
        if (status) {
            where.status = status;
        }
        else {
            where.status = 'PENDING';
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { venue: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                include: {
                    organizer: {
                        select: {
                            id: true,
                            businessName: true,
                            isVerified: true,
                        },
                    },
                    ticketTypes: {
                        select: {
                            name: true,
                            price: true,
                            quantity: true,
                        },
                    },
                    _count: {
                        select: {
                            tickets: true,
                        },
                    },
                },
                orderBy: { submittedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.event.count({ where }),
        ]);
        return {
            data: events,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async approveEvent(eventId, adminId, dto) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending events can be approved');
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                approvedBy: adminId,
                isFeatured: dto.featured || false,
                rejectionReason: null,
            },
            include: {
                organizer: {
                    select: { businessName: true },
                },
                ticketTypes: true,
            },
        });
    }
    async rejectEvent(eventId, adminId, dto) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending events can be rejected');
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: {
                status: 'REJECTED',
                rejectionReason: dto.reason,
                approvedBy: adminId,
            },
            include: {
                organizer: {
                    select: { businessName: true },
                },
            },
        });
    }
    async toggleEventFeatured(eventId) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: { isFeatured: !event.isFeatured },
        });
    }
    async getOrganizers(query) {
        const { status, verified, search, page = 1, limit = 20 } = query;
        const where = {
            type: 'ORGANIZER',
        };
        if (status) {
            where.status = status;
        }
        if (verified !== undefined) {
            where.isVerified = verified;
        }
        if (search) {
            where.OR = [
                { businessName: { contains: search, mode: 'insensitive' } },
                { tradeName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [merchants, total] = await Promise.all([
            this.prisma.merchant.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            phone: true,
                            email: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            events: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.merchant.count({ where }),
        ]);
        return {
            data: merchants,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async verifyOrganizer(merchantId, adminId, dto) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer not found');
        }
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: adminId,
                status: 'ACTIVE',
                commissionRate: dto.commissionRate || merchant.commissionRate,
            },
            include: {
                user: {
                    select: { name: true, email: true, phone: true },
                },
            },
        });
    }
    async suspendOrganizer(merchantId, reason) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer not found');
        }
        return this.prisma.merchant.update({
            where: { id: merchantId },
            data: {
                status: 'SUSPENDED',
            },
        });
    }
    async getShopItems() {
        return this.prisma.shopItem.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        orderItems: true,
                    },
                },
            },
        });
    }
    async createShopItem(dto) {
        return this.prisma.shopItem.create({
            data: {
                name: dto.name,
                description: dto.description,
                price: dto.price,
                imageUrl: dto.imageUrl,
                category: dto.category,
                inStock: dto.inStock ?? true,
            },
        });
    }
    async updateShopItem(id, dto) {
        const item = await this.prisma.shopItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('Shop item not found');
        }
        return this.prisma.shopItem.update({
            where: { id },
            data: {
                ...dto,
                category: dto.category,
            },
        });
    }
    async deleteShopItem(id) {
        const item = await this.prisma.shopItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('Shop item not found');
        }
        const orderCount = await this.prisma.orderItem.count({
            where: { shopItemId: id },
        });
        if (orderCount > 0) {
            return this.prisma.shopItem.update({
                where: { id },
                data: { inStock: false },
            });
        }
        return this.prisma.shopItem.delete({ where: { id } });
    }
    async getPickupLocations() {
        return this.prisma.pickupLocation.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
    }
    async createPickupLocation(dto) {
        return this.prisma.pickupLocation.create({
            data: {
                name: dto.name,
                area: dto.area,
                address: dto.address,
                hours: dto.hours,
                isActive: dto.isActive ?? true,
            },
        });
    }
    async updatePickupLocation(id, dto) {
        const location = await this.prisma.pickupLocation.findUnique({
            where: { id },
        });
        if (!location) {
            throw new common_1.NotFoundException('Pickup location not found');
        }
        return this.prisma.pickupLocation.update({
            where: { id },
            data: dto,
        });
    }
    async deletePickupLocation(id) {
        const location = await this.prisma.pickupLocation.findUnique({
            where: { id },
        });
        if (!location) {
            throw new common_1.NotFoundException('Pickup location not found');
        }
        const orderCount = await this.prisma.order.count({
            where: { pickupLocationId: id },
        });
        if (orderCount > 0) {
            return this.prisma.pickupLocation.update({
                where: { id },
                data: { isActive: false },
            });
        }
        return this.prisma.pickupLocation.delete({ where: { id } });
    }
    async getAllEvents(query) {
        const { status, search, page = 1, limit = 20 } = query;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { venue: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                include: {
                    organizer: {
                        select: {
                            id: true,
                            businessName: true,
                            isVerified: true,
                        },
                    },
                    ticketTypes: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            quantity: true,
                            sold: true,
                        },
                    },
                    _count: {
                        select: {
                            tickets: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.event.count({ where }),
        ]);
        const eventsWithStats = events.map((event) => ({
            ...event,
            ticketsSold: event._count.tickets,
            revenue: event.ticketTypes.reduce((sum, tt) => sum + tt.price * tt.sold, 0),
        }));
        return {
            data: eventsWithStats,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map