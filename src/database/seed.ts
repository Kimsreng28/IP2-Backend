import { PrismaClient } from '@prisma/client';
import 'colors';
import * as readlineSync from 'readline-sync';
import { UserSeeder } from './seed/user.seed';
import { RoleSeeder } from './seed/role.seed';
import { VendorSeeder } from './seed/vendor.seed';
import { AdminSeeder } from './seed/admin.seed';

class SeederInitializer {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private async confirmSeeding(): Promise<boolean> {
    const message =
      'This will drop and seed again. Are you sure you want to proceed?'.yellow;
    return readlineSync.keyInYNStrict(message);
  }

  private async dropAndSyncDatabase() {
    try {
      // The order of deletion matters due to foreign key constraints
      // Delete from child tables first, then parent tables
      const tablesToClear = [
        'adminactivity', 'admin', 'auth', 'address', 'contact', 'creditcard', 'notification',
        'passwordchange', 'wishlist', 'cart', 'orderstatushistory', 'orderitem', 
        'payment', 'vendororder', 'order', 'vendorproduct', 'vendorevent', 'vendor',
        'productreview', 'productquestion', 'productimage', 'productcollection',
        'discount', 'product', 'shippingmethod', 'collection', 'category', 'brand',
        'permission', 'user'
      ];

      for (const table of tablesToClear) {
        try {
          // @ts-ignore - Dynamically access each model
          await this.prisma[table.toLowerCase()].deleteMany();
          console.log(`Cleared ${table} table`.gray);
        } catch (error) {
          console.error(`Error clearing ${table}:`, error);
        }
      }
    } catch (error) {
      console.error('Error while dropping data from the database:', error);
    }
  }

  private async seedData() {
    await RoleSeeder.seed();
    await UserSeeder.seed();
    await VendorSeeder.seed();
    await AdminSeeder.seed();
    // Add other seeders as needed
  }

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

const seederInitializer = new SeederInitializer();
seederInitializer.startSeeding();