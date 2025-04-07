"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("colors");
const readlineSync = require("readline-sync");
const user_seed_1 = require("./seed/user.seed");
class SeederInitializer {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    // Check if data exists in one of the tables to confirm seeding
    async confirmSeeding() {
        const message = 'This will drop and seed again. Are you sure you want to proceed?'.yellow;
        return readlineSync.keyInYNStrict(message);
    }
    // Delete data from tables
    async dropAndSyncDatabase() {
        // IMPORTANT: If you have relationships, ensure you delete in the proper order.
        await this.prisma.user.deleteMany();
    }
    // Seed data to table
    async seedData() {
        await user_seed_1.UserSeed.seed();
    }
    // Handle any seeding errors gracefully
    async handleSeedingError(error) {
        console.error('\x1b[31m%s\x1b[0m', error.message);
        process.exit(1);
    }
    async startSeeding() {
        try {
            const confirmation = await this.confirmSeeding();
            if (!confirmation) {
                console.log('\nSeeding has been cancelled.'.cyan);
                process.exit(0);
            }
            await this.dropAndSyncDatabase();
            await this.seedData();
            console.log('Database seeding completed.'.green);
            process.exit(0);
        }
        catch (error) {
            await this.handleSeedingError(error);
        }
        finally {
            await this.prisma.$disconnect();
        }
    }
}
// Initialize and start seeding
const seederInitializer = new SeederInitializer();
seederInitializer.startSeeding();
