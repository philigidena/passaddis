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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { search, category, city, featured, page = 1, limit = 20, } = query;
        const where = {
            status: 'PUBLISHED',
            date: { gte: new Date() },
        };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { venue: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.category = category;
        }
        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }
        if (featured) {
            where.isFeatured = true;
        }
        const [events, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                include: {
                    organizer: {
                        select: {
                            id: true,
                            businessName: true,
                            logo: true,
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
                },
                orderBy: { date: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.event.count({ where }),
        ]);
        const eventsWithStats = events.map((event) => ({
            ...event,
            minPrice: Math.min(...event.ticketTypes.map((t) => t.price)),
            maxPrice: Math.max(...event.ticketTypes.map((t) => t.price)),
            ticketsAvailable: event.ticketTypes.reduce((sum, t) => sum + (t.quantity - t.sold), 0),
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
    async getFeatured() {
        const events = await this.prisma.event.findMany({
            where: {
                status: 'PUBLISHED',
                isFeatured: true,
                date: { gte: new Date() },
            },
            include: {
                organizer: {
                    select: {
                        id: true,
                        businessName: true,
                    },
                },
                ticketTypes: {
                    select: {
                        price: true,
                        quantity: true,
                        sold: true,
                    },
                },
            },
            orderBy: { date: 'asc' },
            take: 6,
        });
        return events.map((event) => ({
            ...event,
            minPrice: Math.min(...event.ticketTypes.map((t) => t.price)),
            maxPrice: Math.max(...event.ticketTypes.map((t) => t.price)),
        }));
    }
    async findOne(id) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: {
                        id: true,
                        businessName: true,
                        logo: true,
                        description: true,
                    },
                },
                ticketTypes: true,
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return {
            ...event,
            minPrice: Math.min(...event.ticketTypes.map((t) => t.price)),
            maxPrice: Math.max(...event.ticketTypes.map((t) => t.price)),
            ticketsAvailable: event.ticketTypes.reduce((sum, t) => sum + (t.quantity - t.sold), 0),
        };
    }
    async create(organizerId, dto) {
        const { ticketTypes, ...eventData } = dto;
        const event = await this.prisma.event.create({
            data: {
                ...eventData,
                date: new Date(dto.date),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                organizerId,
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
    async update(id, organizerId, dto) {
        const event = await this.prisma.event.findUnique({
            where: { id },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.organizerId !== organizerId) {
            throw new common_1.ForbiddenException('You can only update your own events');
        }
        return this.prisma.event.update({
            where: { id },
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
            include: {
                ticketTypes: true,
            },
        });
    }
    async getOrganizerEvents(organizerId) {
        return this.prisma.event.findMany({
            where: { organizerId },
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
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCategories() {
        const categories = await this.prisma.event.groupBy({
            by: ['category'],
            where: {
                status: 'PUBLISHED',
                date: { gte: new Date() },
            },
            _count: true,
        });
        return categories.map((c) => ({
            category: c.category,
            count: c._count,
        }));
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map