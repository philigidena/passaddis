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
exports.CbeBirrProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let CbeBirrProvider = class CbeBirrProvider {
    configService;
    merchantId;
    apiKey;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.merchantId = this.configService.get('CBE_MERCHANT_ID') || '';
        this.apiKey = this.configService.get('CBE_API_KEY') || '';
        this.apiUrl = this.configService.get('CBE_API_URL') || '';
    }
    async initiatePayment(request) {
        console.log('🏦 CBE Birr Payment Request:', {
            orderId: request.orderId,
            amount: request.amount,
            description: request.description,
        });
        if (!this.merchantId) {
            console.warn('⚠️ CBE Birr not configured - returning mock response');
            return {
                success: true,
                paymentUrl: `https://mock-cbe.example.com/pay/${request.orderId}`,
                referenceId: `CBE${Date.now()}`,
            };
        }
        return {
            success: false,
            error: 'CBE Birr integration pending - configure environment variables',
        };
    }
    async verifyCallback(data) {
        console.log('🏦 CBE Birr Callback:', data);
        return true;
    }
    async checkStatus(referenceId) {
        console.log('🏦 Checking CBE Birr payment status:', referenceId);
        return {
            status: 'PENDING',
            message: 'Status check not implemented',
        };
    }
};
exports.CbeBirrProvider = CbeBirrProvider;
exports.CbeBirrProvider = CbeBirrProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CbeBirrProvider);
//# sourceMappingURL=cbe-birr.provider.js.map