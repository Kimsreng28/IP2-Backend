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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async signup(signupDto) {
        const hashedPassword = await bcrypt.hash(signupDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                first_name: signupDto.firstName,
                last_name: signupDto.lastName,
                display_name: signupDto.displayName,
                email: signupDto.email,
                password: hashedPassword,
            },
        });
        const token = this.generateJwtToken({ userId: user.id, email: user.email });
        await this.prisma.auth.create({
            data: {
                user_id: user.id,
                token,
                is_logged_in: true,
                last_login: new Date(),
            },
        });
        return { user, token };
    }
    async signin(signinDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: signinDto.email },
        });
        if (!user || !(await bcrypt.compare(signinDto.password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = this.generateJwtToken({ userId: user.id, email: user.email });
        await this.prisma.auth.create({
            data: {
                user_id: user.id,
                token,
                is_logged_in: true,
                last_login: new Date(),
            },
        });
        return { user, token };
    }
    async logout(userId) {
        await this.prisma.auth.updateMany({
            where: { user_id: userId, is_logged_in: true },
            data: { is_logged_in: false },
        });
    }
    generateJwtToken(payload) {
        return this.jwtService.sign(payload);
    }
    async validateUser(payload) {
        return this.prisma.user.findUnique({
            where: { id: payload.userId },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
