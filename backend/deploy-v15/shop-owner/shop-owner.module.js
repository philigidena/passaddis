"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopOwnerModule = void 0;
const common_1 = require("@nestjs/common");
const shop_owner_controller_1 = require("./shop-owner.controller");
const shop_owner_service_1 = require("./shop-owner.service");
const prisma_module_1 = require("../prisma/prisma.module");
let ShopOwnerModule = class ShopOwnerModule {
};
exports.ShopOwnerModule = ShopOwnerModule;
exports.ShopOwnerModule = ShopOwnerModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [shop_owner_controller_1.ShopOwnerController],
        providers: [shop_owner_service_1.ShopOwnerService],
        exports: [shop_owner_service_1.ShopOwnerService],
    })
], ShopOwnerModule);
//# sourceMappingURL=shop-owner.module.js.map