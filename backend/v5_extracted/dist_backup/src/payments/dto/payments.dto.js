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
exports.ChapaWebhookDto = exports.CbeBirrCallbackDto = exports.TelebirrCallbackDto = exports.PaymentCallbackDto = exports.InitiatePaymentDto = exports.PaymentMethod = void 0;
const class_validator_1 = require("class-validator");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CHAPA"] = "CHAPA";
    PaymentMethod["TELEBIRR"] = "TELEBIRR";
    PaymentMethod["CBE_BIRR"] = "CBE_BIRR";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class InitiatePaymentDto {
    orderId;
    method;
}
exports.InitiatePaymentDto = InitiatePaymentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "method", void 0);
class PaymentCallbackDto {
    orderId;
    transactionId;
    status;
}
exports.PaymentCallbackDto = PaymentCallbackDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentCallbackDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentCallbackDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentCallbackDto.prototype, "status", void 0);
class TelebirrCallbackDto {
    outTradeNo;
    transactionNo;
    totalAmount;
    tradeStatus;
    msisdn;
}
exports.TelebirrCallbackDto = TelebirrCallbackDto;
class CbeBirrCallbackDto {
    merchantId;
    referenceId;
    amount;
    status;
    transactionId;
}
exports.CbeBirrCallbackDto = CbeBirrCallbackDto;
class ChapaWebhookDto {
    event;
    tx_ref;
    status;
    amount;
    currency;
    charge;
    payment_method;
    reference;
    first_name;
    last_name;
    email;
    created_at;
}
exports.ChapaWebhookDto = ChapaWebhookDto;
//# sourceMappingURL=payments.dto.js.map