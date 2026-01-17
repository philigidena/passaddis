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
exports.ValidatePickupDto = exports.CreateShopOrderDto = exports.CartItemDto = exports.ShopItemQueryDto = exports.ShopCategory = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ShopCategory;
(function (ShopCategory) {
    ShopCategory["WATER"] = "WATER";
    ShopCategory["DRINKS"] = "DRINKS";
    ShopCategory["SNACKS"] = "SNACKS";
    ShopCategory["MERCH"] = "MERCH";
})(ShopCategory || (exports.ShopCategory = ShopCategory = {}));
class ShopItemQueryDto {
    category;
    search;
}
exports.ShopItemQueryDto = ShopItemQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ShopCategory),
    __metadata("design:type", String)
], ShopItemQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShopItemQueryDto.prototype, "search", void 0);
class CartItemDto {
    shopItemId;
    quantity;
}
exports.CartItemDto = CartItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "shopItemId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], CartItemDto.prototype, "quantity", void 0);
class CreateShopOrderDto {
    items;
    pickupLocationId;
}
exports.CreateShopOrderDto = CreateShopOrderDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CartItemDto),
    __metadata("design:type", Array)
], CreateShopOrderDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShopOrderDto.prototype, "pickupLocationId", void 0);
class ValidatePickupDto {
    qrCode;
}
exports.ValidatePickupDto = ValidatePickupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidatePickupDto.prototype, "qrCode", void 0);
//# sourceMappingURL=shop.dto.js.map