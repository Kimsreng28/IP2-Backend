
import { PrismaClient } from '@prisma/client';
import 'colors';
import * as readlineSync from 'readline-sync';
import { UserSeed } from './seed/user.seed';
import { ProductSeeder } from './seed/product.seed';
import { VendorProductSeed } from './seed/vendorProduct.seed';
import { OrderSeed } from './seed/order.seed';
import { OrderItemSeed } from './seed/orderItem.seed';
import { OrderStatusHistorySeed } from './seed/orderStatusHistory.seed';
import { VendorEventSeed } from './seed/vendorEvent.seed';
import { VendorOrderSeed } from './seed/vendorOrder.seed';
import { shippingMethodSeed } from './seed/shippingMethod.seed';
import { CreditCardSeed } from './seed/creditCard.seed';
import { PaymentSeed } from './seed/payment.seed';

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
        // 1. Delete dependent records (in correct order)
    await this.prisma.shippingMethod.deleteMany();
    await this.prisma.orderStatusHistory.deleteMany();
    await this.prisma.orderItem.deleteMany();

    // 2. Delete role associations and subtypes
    await this.prisma.admin.deleteMany();
    await this.prisma.vendor.deleteMany();
    await this.prisma.customer.deleteMany();
    await this.prisma.user_Role.deleteMany();
    await this.prisma.creditCard.deleteMany();
    await this.prisma.payment.deleteMany();
    await this.prisma.order.deleteMany();
    // 3. Now it's safe to delete users
    await this.prisma.user.deleteMany();
  }

  // Seed data to table
  private async seedData() {
    await shippingMethodSeed.seed();
    await UserSeed.seed();
    await ProductSeeder.seed();
    await CreditCardSeed.seed();
    await OrderSeed.seed();
    await PaymentSeed.seed();
    await VendorProductSeed.seed();
    await OrderItemSeed.seed();
    await OrderStatusHistorySeed.seed();
    await VendorEventSeed.seed();
    await VendorOrderSeed.seed();
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
