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
exports.ChapaProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ChapaProvider = class ChapaProvider {
    configService;
    secretKey;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.secretKey = this.configService.get('CHAPA_SECRET_KEY') || '';
        this.apiUrl = 'https://api.chapa.co/v1';
    }
    async initiatePayment(request) {
        if (!this.secretKey) {
            console.warn('⚠️ Chapa not configured - returning mock response');
            return {
                success: true,
                checkout_url: `https://checkout.chapa.co/mock/${request.tx_ref}`,
                tx_ref: request.tx_ref,
            };
        }
        try {
            const sanitizedDescription = (request.customization?.description || 'Event Tickets and Shop').replace(/[^a-zA-Z0-9\-_\s.]/g, '');
            const payload = {
                amount: request.amount.toString(),
                currency: request.currency || 'ETB',
                phone_number: request.phone,
                tx_ref: request.tx_ref,
                callback_url: request.callback_url,
                return_url: request.return_url,
                customization: {
                    title: request.customization?.title || 'PassAddis',
                    description: sanitizedDescription,
                },
            };
            console.log('Chapa payment request:', JSON.stringify(payload, null, 2));
            const response = await fetch(`${this.apiUrl}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            console.log('Chapa API response:', JSON.stringify(data, null, 2));
            if (data.status === 'success') {
                return {
                    success: true,
                    checkout_url: data.data.checkout_url,
                    tx_ref: request.tx_ref,
                };
            }
            const errorMessage = data.message ||
                (data.errors ? JSON.stringify(data.errors) : null) ||
                JSON.stringify(data);
            console.error('Chapa API error:', errorMessage);
            return {
                success: false,
                error: data.errors || data.message || 'Payment initialization failed',
            };
        }
        catch (error) {
            console.error('Chapa payment error:', error);
            return {
                success: false,
                error: 'Payment service unavailable',
            };
        }
    }
    async verifyPayment(tx_ref) {
        if (!this.secretKey) {
            return { status: 'success', verified: true };
        }
        try {
            const response = await fetch(`${this.apiUrl}/transaction/verify/${tx_ref}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                },
            });
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('Chapa verify error:', error);
            return { status: 'error', message: 'Verification failed' };
        }
    }
    verifyWebhook(signature, payload) {
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', this.secretKey)
            .update(payload)
            .digest('hex');
        return signature === expectedSignature;
    }
};
exports.ChapaProvider = ChapaProvider;
exports.ChapaProvider = ChapaProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ChapaProvider);
//# sourceMappingURL=chapa.provider.js.map