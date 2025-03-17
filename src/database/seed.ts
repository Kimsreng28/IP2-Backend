import { PrismaClient } from '@prisma/client';
import "colors";
import * as readlineSync from 'readline-sync';
import { UserSeed } from './seed/user.seed';

class SeederInitializer {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Check if data exists in one of the tables to confirm seeding
  private async confirmSeeding(): Promise<boolean> {
    const message = 'This will drop and seed again. Are you sure you want to proceed?'.yellow;
    return readlineSync.keyInYNStrict(message);
  }

  private async dropAndSyncDatabase() {
    try {
      // Check if there are any users in the database
      const userCount = await this.prisma.user.count();
      if (userCount > 0) {
        console.log(`Found ${userCount} users. Proceeding with deletion...`);
        // 1
        await this.prisma.user_Role.deleteMany();

        // 2
        await this.prisma.user.deleteMany();

        console.log('User data successfully deleted.');

      } else {
        console.log('No users found in the database. Skipping deletion.');
      }
    } catch (error) {
      console.error('Error while dropping data from the database:', error);
    }
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
