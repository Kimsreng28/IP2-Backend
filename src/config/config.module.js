"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigModule = void 0;
// ===========================================================================>> Core Library
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
// ===========================================================================>> Third Party Library
const multer = require("multer");
// ===========================================================================>> Custom Library
const prisma_service_1 = require("../../../../../../../../src/prisma/prisma.service");
/** @noted We use Global that allows all modules to access and use all services */
let ConfigModule = class ConfigModule {
};
exports.ConfigModule = ConfigModule;
exports.ConfigModule = ConfigModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: multer.memoryStorage(),
            }),
            axios_1.HttpModule.register({
                timeout: 5000,
                maxRedirects: 5,
            }),
        ],
        providers: [
            prisma_service_1.PrismaService, // Register PrismaService globally
        ],
        exports: [
            prisma_service_1.PrismaService,
            axios_1.HttpModule,
        ],
    })
], ConfigModule);
