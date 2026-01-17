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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const admin_dto_1 = require("./dto/admin.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }
    async getUsers(query) {
        return this.adminService.getUsers(query);
    }
    async getUser(id) {
        return this.adminService.getUser(id);
    }
    async updateUserRole(id, dto, adminId) {
        return this.adminService.updateUserRole(id, dto, adminId);
    }
    async getAllEvents(query) {
        return this.adminService.getAllEvents(query);
    }
    async getPendingEvents(query) {
        return this.adminService.getPendingEvents(query);
    }
    async approveEvent(id, adminId, dto) {
        return this.adminService.approveEvent(id, adminId, dto);
    }
    async rejectEvent(id, adminId, dto) {
        return this.adminService.rejectEvent(id, adminId, dto);
    }
    async toggleFeatured(id) {
        return this.adminService.toggleEventFeatured(id);
    }
    async getOrganizers(query) {
        return this.adminService.getOrganizers(query);
    }
    async verifyOrganizer(id, adminId, dto) {
        return this.adminService.verifyOrganizer(id, adminId, dto);
    }
    async suspendOrganizer(id, reason) {
        return this.adminService.suspendOrganizer(id, reason);
    }
    async getShopItems() {
        return this.adminService.getShopItems();
    }
    async createShopItem(dto) {
        return this.adminService.createShopItem(dto);
    }
    async updateShopItem(id, dto) {
        return this.adminService.updateShopItem(id, dto);
    }
    async deleteShopItem(id) {
        return this.adminService.deleteShopItem(id);
    }
    async getPickupLocations() {
        return this.adminService.getPickupLocations();
    }
    async createPickupLocation(dto) {
        return this.adminService.createPickupLocation(dto);
    }
    async updatePickupLocation(id, dto) {
        return this.adminService.updatePickupLocation(id, dto);
    }
    async deletePickupLocation(id) {
        return this.adminService.deletePickupLocation(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.UserQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateUserRoleDto, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.EventQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllEvents", null);
__decorate([
    (0, common_1.Get)('events/pending'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.EventQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingEvents", null);
__decorate([
    (0, common_1.Post)('events/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, admin_dto_1.ApproveEventDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveEvent", null);
__decorate([
    (0, common_1.Post)('events/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, admin_dto_1.RejectEventDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectEvent", null);
__decorate([
    (0, common_1.Patch)('events/:id/featured'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "toggleFeatured", null);
__decorate([
    (0, common_1.Get)('organizers'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.OrganizerQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrganizers", null);
__decorate([
    (0, common_1.Post)('organizers/:id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, admin_dto_1.VerifyOrganizerDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyOrganizer", null);
__decorate([
    (0, common_1.Post)('organizers/:id/suspend'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "suspendOrganizer", null);
__decorate([
    (0, common_1.Get)('shop/items'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getShopItems", null);
__decorate([
    (0, common_1.Post)('shop/items'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateShopItemDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createShopItem", null);
__decorate([
    (0, common_1.Patch)('shop/items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateShopItemDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateShopItem", null);
__decorate([
    (0, common_1.Delete)('shop/items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteShopItem", null);
__decorate([
    (0, common_1.Get)('pickup-locations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPickupLocations", null);
__decorate([
    (0, common_1.Post)('pickup-locations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreatePickupLocationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createPickupLocation", null);
__decorate([
    (0, common_1.Patch)('pickup-locations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdatePickupLocationDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePickupLocation", null);
__decorate([
    (0, common_1.Delete)('pickup-locations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deletePickupLocation", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map