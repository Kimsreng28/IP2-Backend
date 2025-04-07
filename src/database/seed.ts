import { PrismaClient } from '@prisma/client';
import 'colors';
import * as readlineSync from 'readline-sync';
import { UserSeed } from './seed/user.seed';

class SeederInitializer {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Check if data exists in one of the tables to confirm seeding
  private async confirmSeeding(): Promise<boolean> {
    const message =
      'This will drop and seed again. Are you sure you want to proceed?'.yellow;
    return readlineSync.keyInYNStrict(message);
  }

  // Delete data from tables
  private async dropAndSyncDatabase() {
    // IMPORTANT: If you have relationships, ensure you delete in the proper order.
    await this.prisma.user.deleteMany();
  }

  // Seed data to table
  private async seedData() {
    await UserSeed.seed();
  }

  // Handle any seeding errors gracefully
  private async handleSeedingError(error: Error) {
    console.error('\x1b[31m%s\x1b[0m', error.message);
    process.exit(1);
  }

  public async startSeeding() {
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
    } catch (error) {
      await this.handleSeedingError(error);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Initialize and start seeding
const seederInitializer = new SeederInitializer();
seederInitializer.startSeeding();
