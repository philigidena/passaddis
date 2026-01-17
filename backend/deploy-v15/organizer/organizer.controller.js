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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizerController = void 0;
const common_1 = require("@nestjs/common");
const organizer_service_1 = require("./organizer.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const organizer_dto_1 = require("./dto/organizer.dto");
let OrganizerController = class OrganizerController {
    organizerService;
    constructor(organizerService) {
        this.organizerService = organizerService;
    }
    async getProfile(userId) {
        return this.organizerService.getProfile(userId);
    }
    async createProfile(userId, dto) {
        return this.organizerService.createProfile(userId, dto);
    }
    async updateProfile(userId, dto) {
        return this.organizerService.updateProfile(userId, dto);
    }
    async getDashboard(userId) {
        return this.organizerService.getDashboard(userId);
    }
    async getMyEvents(userId) {
        return this.organizerService.getMyEvents(userId);
    }
    async getEvent(userId, eventId) {
        return this.organizerService.getEvent(userId, eventId);
    }
    async createEvent(userId, dto) {
        return this.organizerService.createEvent(userId, dto);
    }
    async updateEvent(userId, eventId, dto) {
        return this.organizerService.updateEvent(userId, eventId, dto);
    }
    async submitForApproval(userId, eventId) {
        return this.organizerService.submitEventForApproval(userId, eventId);
    }
    async publishEvent(userId, eventId) {
        return this.organizerService.publishEvent(userId, eventId);
    }
    async cancelEvent(userId, eventId) {
        return this.organizerService.cancelEvent(userId, eventId);
    }
    async getEventAttendees(userId, eventId) {
        return this.organizerService.getEventAttendees(userId, eventId);
    }
    async addTicketType(userId, eventId, dto) {
        return this.organizerService.addTicketType(userId, eventId, dto);
    }
    async updateTicketType(userId, eventId, ticketTypeId, dto) {
        return this.organizerService.updateTicketType(userId, eventId, ticketTypeId, dto);
    }
    async deleteTicketType(userId, eventId, ticketTypeId) {
        return this.organizerService.deleteTicketType(userId, eventId, ticketTypeId);
    }
};
exports.OrganizerController = OrganizerController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organizer_dto_1.CreateOrganizerProfileDto]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organizer_dto_1.UpdateOrganizerProfileDto]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "getMyEvents", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Post)('events'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organizer_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)('events/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, organizer_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Post)('events/:id/submit'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "submitForApproval", null);
__decorate([
    (0, common_1.Post)('events/:id/publish'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "publishEvent", null);
__decorate([
    (0, common_1.Post)('events/:id/cancel'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "cancelEvent", null);
__decorate([
    (0, common_1.Get)('events/:id/attendees'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "getEventAttendees", null);
__decorate([
    (0, common_1.Post)('events/:id/ticket-types'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, organizer_dto_1.CreateTicketTypeDto]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "addTicketType", null);
__decorate([
    (0, common_1.Patch)('events/:eventId/ticket-types/:ticketTypeId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Param)('ticketTypeId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "updateTicketType", null);
__decorate([
    (0, common_1.Delete)('events/:eventId/ticket-types/:ticketTypeId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ORGANIZER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Param)('ticketTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrganizerController.prototype, "deleteTicketType", null);
exports.OrganizerController = OrganizerController = __decorate([
    (0, common_1.Controller)('organizer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [organizer_service_1.OrganizerService])
], OrganizerController);
//# sourceMappingURL=organizer.controller.js.map