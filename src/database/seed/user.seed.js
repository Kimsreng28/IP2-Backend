"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSeed = void 0;
const client_1 = require("@prisma/client");
class UserSeed {
}
exports.UserSeed = UserSeed;
_a = UserSeed;
UserSeed.prisma = new client_1.PrismaClient();
UserSeed.seed = async () => {
    try {
        const result = await _a.prisma.user.createMany({
            data: [],
        });
        console.log(`Users seeded successfully. ${result.count} records created.`.green);
    }
    catch (error) {
        console.error('🐞 Error seeding users:', error);
    }
    finally {
        await _a.prisma.$disconnect();
    }
};
