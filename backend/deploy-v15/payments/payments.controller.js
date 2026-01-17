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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const payments_dto_1 = require("./dto/payments.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async initiatePayment(userId, dto) {
        return this.paymentsService.initiatePayment(userId, dto);
    }
    async getPaymentStatus(userId, orderId) {
        return this.paymentsService.getPaymentStatus(userId, orderId);
    }
    async telebirrCallback(data) {
        return this.paymentsService.handleTelebirrCallback(data);
    }
    async cbeBirrCallback(data) {
        return this.paymentsService.handleCbeBirrCallback(data);
    }
    async chapaCallback(data, signature) {
        return this.paymentsService.handleChapaWebhook(data, signature);
    }
    async verifyPayment(userId, orderId) {
        return this.paymentsService.verifyChapaPayment(userId, orderId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('initiate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payments_dto_1.InitiatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('status/:orderId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStatus", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('callback/telebirr'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.TelebirrCallbackDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "telebirrCallback", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('callback/cbe_birr'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.CbeBirrCallbackDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cbeBirrCallback", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('callback/chapa'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-chapa-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.ChapaWebhookDto, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "chapaCallback", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('verify/:orderId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map