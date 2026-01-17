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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
const QRCode = __importStar(require("qrcode"));
let TicketsService = class TicketsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateQrCode() {
        return `PA-${(0, uuid_1.v4)().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
    }
    async purchaseTickets(userId, dto) {
        const { eventId, tickets } = dto;
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { ticketTypes: true },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        if (event.status !== 'PUBLISHED') {
            throw new common_1.BadRequestException('Event is not available for purchase');
        }
        if (new Date(event.date) < new Date()) {
            throw new common_1.BadRequestException('Event has already passed');
        }
        let subtotal = 0;
        const ticketCreations = [];
        for (const item of tickets) {
            const ticketType = event.ticketTypes.find((tt) => tt.id === item.ticketTypeId);
            if (!ticketType) {
                throw new common_1.NotFoundException(`Ticket type ${item.ticketTypeId} not found`);
            }
            if (item.quantity > ticketType.maxPerOrder) {
                throw new common_1.BadRequestException(`Maximum ${ticketType.maxPerOrder} tickets per order for ${ticketType.name}`);
            }
            const available = ticketType.quantity - ticketType.sold;
            if (item.quantity > available) {
                throw new common_1.ConflictException(`Only ${available} tickets available for ${ticketType.name}`);
            }
            subtotal += ticketType.price * item.quantity;
            ticketCreations.push({
                ticketTypeId: ticketType.id,
                price: ticketType.price,
                quantity: item.quantity,
            });
        }
        const serviceFee = Math.round(subtotal * 0.05);
        const total = subtotal + serviceFee;
        const result = await this.prisma.$transaction(async (tx) => {
            const orderNumber = `PA${Date.now().toString(36).toUpperCase()}`;
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    subtotal,
                    serviceFee,
                    total,
                    status: 'PENDING',
                },
            });
            const createdTickets = [];
            for (const item of ticketCreations) {
                for (let i = 0; i < item.quantity; i++) {
                    const qrCode = this.generateQrCode();
                    const ticket = await tx.ticket.create({
                        data: {
                            qrCode,
                            userId,
                            eventId,
                            ticketTypeId: item.ticketTypeId,
                            orderId: order.id,
                        },
                    });
                    createdTickets.push(ticket);
                }
                await tx.ticketType.update({
                    where: { id: item.ticketTypeId },
                    data: { sold: { increment: item.quantity } },
                });
            }
            return { order, tickets: createdTickets };
        });
        return {
            order: result.order,
            tickets: result.tickets,
            paymentRequired: total,
        };
    }
    async getUserTickets(userId) {
        const tickets = await this.prisma.ticket.findMany({
            where: { userId },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        venue: true,
                        date: true,
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
        return tickets;
    }
    async getTicket(userId, ticketId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                event: true,
                ticketType: true,
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (ticket.userId !== userId) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode, {
            width: 300,
            margin: 2,
        });
        return {
            ...ticket,
            qrCodeImage: qrCodeDataUrl,
        };
    }
    async validateTicket(dto) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { qrCode: dto.qrCode },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        organizerId: true,
                    },
                },
                ticketType: {
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
        if (!ticket) {
            return {
                valid: false,
                message: 'Ticket not found',
            };
        }
        if (ticket.status === 'USED') {
            return {
                valid: false,
                message: 'Ticket already used',
                usedAt: ticket.usedAt,
            };
        }
        if (ticket.status === 'CANCELLED') {
            return {
                valid: false,
                message: 'Ticket has been cancelled',
            };
        }
        await this.prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                status: 'USED',
                usedAt: new Date(),
            },
        });
        return {
            valid: true,
            message: 'Ticket validated successfully',
            ticket: {
                id: ticket.id,
                event: ticket.event.title,
                ticketType: ticket.ticketType.name,
                attendee: ticket.user.name || ticket.user.phone,
            },
        };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map