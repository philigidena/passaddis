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
exports.ShopOwnerController = void 0;
const common_1 = require("@nestjs/common");
const shop_owner_service_1 = require("./shop-owner.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const shop_owner_dto_1 = require("./dto/shop-owner.dto");
let ShopOwnerController = class ShopOwnerController {
    shopOwnerService;
    constructor(shopOwnerService) {
        this.shopOwnerService = shopOwnerService;
    }
    async getProfile(userId) {
        return this.shopOwnerService.getProfile(userId);
    }
    async createProfile(userId, dto) {
        return this.shopOwnerService.createProfile(userId, dto);
    }
    async updateProfile(userId, dto) {
        return this.shopOwnerService.updateProfile(userId, dto);
    }
    async getDashboard(userId) {
        return this.shopOwnerService.getDashboard(userId);
    }
    async getOrders(userId, status) {
        return this.shopOwnerService.getOrders(userId, status);
    }
    async getOrder(userId, orderId) {
        return this.shopOwnerService.getOrder(userId, orderId);
    }
    async updateOrderStatus(userId, orderId, dto) {
        return this.shopOwnerService.updateOrderStatus(userId, orderId, dto.status);
    }
    async validatePickup(userId, qrCode) {
        return this.shopOwnerService.validatePickup(userId, qrCode);
    }
    async getSalesAnalytics(userId, period = 'month') {
        return this.shopOwnerService.getSalesAnalytics(userId, period);
    }
};
exports.ShopOwnerController = ShopOwnerController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shop_owner_dto_1.CreateShopOwnerProfileDto]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SHOP_OWNER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shop_owner_dto_1.UpdateShopOwnerProfileDto]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SHOP_OWNER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SHOP_OWNER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SHOP_OWNER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SHOP_OWNER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, shop_owner_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Post)('validate-pickup'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SHOP_OWNER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)('qrCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "validatePickup", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SHOP_OWNER', 'ADMIN'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShopOwnerController.prototype, "getSalesAnalytics", null);
exports.ShopOwnerController = ShopOwnerController = __decorate([
    (0, common_1.Controller)('shop-owner'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [shop_owner_service_1.ShopOwnerService])
], ShopOwnerController);
//# sourceMappingURL=shop-owner.controller.js.map