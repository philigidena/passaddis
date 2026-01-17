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
exports.TelebirrProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TelebirrProvider = class TelebirrProvider {
    configService;
    appId;
    appKey;
    publicKey;
    shortCode;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.appId = this.configService.get('TELEBIRR_APP_ID') || '';
        this.appKey = this.configService.get('TELEBIRR_APP_KEY') || '';
        this.publicKey = this.configService.get('TELEBIRR_PUBLIC_KEY') || '';
        this.shortCode = this.configService.get('TELEBIRR_SHORT_CODE') || '';
        this.apiUrl = this.configService.get('TELEBIRR_API_URL') || '';
    }
    async initiatePayment(request) {
        console.log('📱 Telebirr Payment Request:', {
            orderId: request.orderId,
            amount: request.amount,
            subject: request.subject,
        });
        if (!this.appId) {
            console.warn('⚠️ Telebirr not configured - returning mock response');
            return {
                success: true,
                paymentUrl: `https://mock-telebirr.example.com/pay/${request.orderId}`,
                outTradeNo: `TB${Date.now()}`,
            };
        }
        return {
            success: false,
            error: 'Telebirr integration pending - configure environment variables',
        };
    }
    async verifyCallback(data) {
        console.log('📱 Telebirr Callback:', data);
        return true;
    }
    async checkStatus(outTradeNo) {
        console.log('📱 Checking Telebirr payment status:', outTradeNo);
        return {
            status: 'PENDING',
            message: 'Status check not implemented',
        };
    }
};
exports.TelebirrProvider = TelebirrProvider;
exports.TelebirrProvider = TelebirrProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TelebirrProvider);
//# sourceMappingURL=telebirr.provider.js.map