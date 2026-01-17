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
exports.AfroSmsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AfroSmsProvider = class AfroSmsProvider {
    configService;
    apiKey;
    identifier;
    senderId;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('AFRO_SMS_API_KEY') || '';
        this.identifier = this.configService.get('AFRO_SMS_IDENTIFIER') || '';
        this.senderId = this.configService.get('AFRO_SMS_SENDER_ID') || 'PassAddis';
        this.apiUrl = 'https://api.afromessage.com/api/send';
    }
    async sendSms(phone, message) {
        if (!this.apiKey) {
            console.warn('⚠️ Afro SMS not configured - message not sent');
            console.log(`📱 SMS to ${phone}: ${message}`);
            return { success: true, messageId: 'mock-' + Date.now() };
        }
        try {
            const formattedPhone = this.formatPhone(phone);
            const params = new URLSearchParams({
                to: formattedPhone,
                message: message,
            });
            const url = `${this.apiUrl}?${params.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            }
            catch {
                console.error('Afro SMS non-JSON response:', responseText);
                return {
                    success: false,
                    error: responseText || 'Invalid API response',
                };
            }
            if (data.acknowledge === 'success') {
                console.log(`✅ SMS sent to ${formattedPhone}`);
                return {
                    success: true,
                    messageId: data.response?.id || data.response?.message_id,
                };
            }
            console.error('Afro SMS error:', data);
            return {
                success: false,
                error: data.response?.errors?.[0] || data.message || 'SMS sending failed',
            };
        }
        catch (error) {
            console.error('Afro SMS exception:', error);
            return {
                success: false,
                error: 'SMS service unavailable',
            };
        }
    }
    async sendOtp(phone, code) {
        const message = `Your PassAddis verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;
        return this.sendSms(phone, message);
    }
    async sendTicketConfirmation(phone, eventName, ticketCode) {
        const message = `PassAddis: Your ticket for "${eventName}" is confirmed! Ticket code: ${ticketCode}. Show this at entry.`;
        return this.sendSms(phone, message);
    }
    async sendOrderConfirmation(phone, orderId, pickupCode) {
        const message = `PassAddis: Order ${orderId.slice(-6).toUpperCase()} confirmed! Pickup code: ${pickupCode}. Show this code at the pickup location.`;
        return this.sendSms(phone, message);
    }
    formatPhone(phone) {
        let cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+')) {
            cleaned = cleaned.substring(1);
        }
        if (cleaned.startsWith('0')) {
            cleaned = '251' + cleaned.substring(1);
        }
        if (cleaned.length === 9 && cleaned.startsWith('9')) {
            cleaned = '251' + cleaned;
        }
        return cleaned;
    }
};
exports.AfroSmsProvider = AfroSmsProvider;
exports.AfroSmsProvider = AfroSmsProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AfroSmsProvider);
//# sourceMappingURL=afro-sms.provider.js.map