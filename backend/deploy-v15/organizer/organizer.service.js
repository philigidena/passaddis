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
exports.OrganizerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrganizerService = class OrganizerService {
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
        if (!merchant) {
            const organizer = await this.prisma.organizer.findUnique({
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
            if (organizer) {
                return { ...organizer, isMerchant: false };
            }
            return null;
        }
        return { ...merchant, isMerchant: true };
    }
    async createProfile(userId, dto) {
        const existing = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (existing) {
            throw new common_1.ConflictException('Organizer profile already exists');
        }
        const count = await this.prisma.merchant.count();
        const merchantCode = `PA${String(count + 1).padStart(4, '0')}`;
        const merchant = await this.prisma.merchant.create({
            data: {
                merchantCode,
                businessName: dto.businessName,
                tradeName: dto.tradeName,
                description: dto.description,
                logo: dto.logo,
                type: 'ORGANIZER',
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
            data: { role: 'ORGANIZER' },
        });
        return merchant;
    }
    async updateProfile(userId, dto) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
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
            throw new common_1.NotFoundException('Organizer profile not found. Please create one first.');
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const eventStats = await this.prisma.event.groupBy({
            by: ['status'],
            where: { merchantId: merchant.id },
            _count: true,
        });
        const events = await this.prisma.event.findMany({
            where: { merchantId: merchant.id },
            select: { id: true },
        });
        const eventIds = events.map((e) => e.id);
        const ticketStats = await this.prisma.ticket.aggregate({
            where: { eventId: { in: eventIds } },
            _count: true,
        });
        const revenue = await this.prisma.order.aggregate({
            where: {
                status: { in: ['PAID', 'COMPLETED'] },
                tickets: { some: { eventId: { in: eventIds } } },
            },
            _sum: { subtotal: true },
        });
        const monthlyTickets = await this.prisma.ticket.count({
            where: {
                eventId: { in: eventIds },
                createdAt: { gte: startOfMonth },
            },
        });
        const monthlyRevenue = await this.prisma.order.aggregate({
            where: {
                status: { in: ['PAID', 'COMPLETED'] },
                tickets: { some: { eventId: { in: eventIds } } },
                createdAt: { gte: startOfMonth },
            },
            _sum: { subtotal: true },
        });
        const walletBalance = await this.prisma.walletTransaction.aggregate({
            where: { merchantId: merchant.id },
            _sum: { netAmount: true },
        });
        const pendingSettlement = await this.prisma.order.aggregate({
            where: {
                status: { in: ['PAID', 'COMPLETED'] },
                settledAt: null,
                tickets: { some: { eventId: { in: eventIds } } },
            },
            _sum: { merchantAmount: true },
        });
        const statusCounts = eventStats.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = item._count;
            return acc;
        }, {
            draft: 0,
            pending: 0,
            approved: 0,
            published: 0,
            rejected: 0,
            cancelled: 0,
            completed: 0,
        });
        return {
            profile: {
                id: merchant.id,
                businessName: merchant.businessName,
                status: merchant.status,
                isVerified: merchant.isVerified,
                commissionRate: merchant.commissionRate,
            },
            events: {
                total: events.length,
                ...statusCounts,
            },
            tickets: {
                totalSold: ticketStats._count,
                revenue: revenue._sum.subtotal || 0,
                thisMonth: {
                    sold: monthlyTickets,
                    revenue: monthlyRevenue._sum.subtotal || 0,
                },
            },
            wallet: {
                balance: walletBalance._sum.netAmount || 0,
                pendingSettlement: pendingSettlement._sum.merchantAmount || 0,
                totalEarnings: revenue._sum.subtotal || 0,
            },
        };
    }
    async getMyEvents(userId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        return this.prisma.event.findMany({
            where: { merchantId: merchant.id },
            include: {
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
        });
    }
    async getEvent(userId, eventId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                ticketTypes: true,
                _count: {
                    select: {
                        tickets: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('You do not own this event');
        }
        return event;
    }
    async createEvent(userId, dto) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found. Please create one first.');
        }
        const { ticketTypes, ...eventData } = dto;
        const event = await this.prisma.event.create({
            data: {
                title: eventData.title,
                description: eventData.description,
                imageUrl: eventData.imageUrl,
                venue: eventData.venue,
                address: eventData.address,
                city: eventData.city || 'Addis Ababa',
                date: new Date(eventData.date),
                endDate: eventData.endDate ? new Date(eventData.endDate) : null,
                category: eventData.category,
                status: 'DRAFT',
                merchantId: merchant.id,
                ticketTypes: {
                    create: ticketTypes.map((tt) => ({
                        name: tt.name,
                        description: tt.description,
                        price: tt.price,
                        quantity: tt.quantity,
                        maxPerOrder: tt.maxPerOrder || 10,
                    })),
                },
            },
            include: {
                ticketTypes: true,
            },
        });
        return event;
    }
    async updateEvent(userId, eventId, dto) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('You do not own this event');
        }
        if (event.status === 'PUBLISHED') {
            const allowedFields = ['imageUrl'];
            const attemptedFields = Object.keys(dto);
            const disallowedFields = attemptedFields.filter((f) => !allowedFields.includes(f));
            if (disallowedFields.length > 0) {
                throw new common_1.BadRequestException('Cannot edit published events. Only image can be updated.');
            }
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                category: dto.category,
            },
            include: {
                ticketTypes: true,
            },
        });
    }
    async submitEventForApproval(userId, eventId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { ticketTypes: true },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('You do not own this event');
        }
        if (event.status !== 'DRAFT' && event.status !== 'REJECTED') {
            throw new common_1.BadRequestException('Only draft or rejected events can be submitted for approval');
        }
        if (event.ticketTypes.length === 0) {
            throw new common_1.BadRequestException('Event must have at least one ticket type');
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: {
                status: 'PENDING',
                submittedAt: new Date(),
                rejectionReason: null,
            },
            include: {
                ticketTypes: true,
            },
        });
    }
    async publishEvent(userId, eventId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('You do not own this event');
        }
        if (event.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Only approved events can be published');
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: { status: 'PUBLISHED' },
            include: {
                ticketTypes: true,
            },
        });
    }
    async cancelEvent(userId, eventId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: { tickets: true },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('You do not own this event');
        }
        if (event._count.tickets > 0) {
            throw new common_1.BadRequestException('Cannot cancel event with sold tickets. Please contact support.');
        }
        return this.prisma.event.update({
            where: { id: eventId },
            data: { status: 'CANCELLED' },
        });
    }
    async getEventAttendees(userId, eventId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('You do not own this event');
        }
        const tickets = await this.prisma.ticket.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
                ticketType: {
                    select: {
                        name: true,
                        price: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const stats = {
            total: tickets.length,
            valid: tickets.filter((t) => t.status === 'VALID').length,
            used: tickets.filter((t) => t.status === 'USED').length,
            cancelled: tickets.filter((t) => t.status === 'CANCELLED').length,
        };
        return {
            stats,
            attendees: tickets,
        };
    }
    async addTicketType(userId, eventId, dto) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('You do not own this event');
        }
        if (event.status === 'PUBLISHED') {
            throw new common_1.BadRequestException('Cannot add ticket types to published events');
        }
        return this.prisma.ticketType.create({
            data: {
                name: dto.name,
                description: dto.description,
                price: dto.price,
                quantity: dto.quantity,
                maxPerOrder: dto.maxPerOrder || 10,
                eventId,
            },
        });
    }
    async updateTicketType(userId, eventId, ticketTypeId, dto) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event || event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('Event not found or access denied');
        }
        const ticketType = await this.prisma.ticketType.findUnique({
            where: { id: ticketTypeId },
        });
        if (!ticketType || ticketType.eventId !== eventId) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        if (dto.price && ticketType.sold > 0 && dto.price !== ticketType.price) {
            throw new common_1.BadRequestException('Cannot change price for ticket type with sold tickets');
        }
        return this.prisma.ticketType.update({
            where: { id: ticketTypeId },
            data: dto,
        });
    }
    async deleteTicketType(userId, eventId, ticketTypeId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { userId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('Organizer profile not found');
        }
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event || event.merchantId !== merchant.id) {
            throw new common_1.ForbiddenException('Event not found or access denied');
        }
        const ticketType = await this.prisma.ticketType.findUnique({
            where: { id: ticketTypeId },
        });
        if (!ticketType || ticketType.eventId !== eventId) {
            throw new common_1.NotFoundException('Ticket type not found');
        }
        if (ticketType.sold > 0) {
            throw new common_1.BadRequestException('Cannot delete ticket type with sold tickets');
        }
        return this.prisma.ticketType.delete({
            where: { id: ticketTypeId },
        });
    }
};
exports.OrganizerService = OrganizerService;
exports.OrganizerService = OrganizerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizerService);
//# sourceMappingURL=organizer.service.js.map