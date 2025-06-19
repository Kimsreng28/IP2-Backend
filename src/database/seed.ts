
import { PrismaClient } from '@prisma/client';
import 'colors';
import * as readlineSync from 'readline-sync';
import { CreditCardSeed } from './seed/creditCard.seed';
import { OrderItemSeed } from './seed/orderItem.seed';
import { OrderStatusHistorySeed } from './seed/orderStatusHistory.seed';
import { PaymentSeed } from './seed/payment.seed';
import { ProductSeeder } from './seed/product.seed';
import { shippingMethodSeed } from './seed/shippingMethod.seed';
import { UserSeed } from './seed/user.seed';
import { VendorEventSeed } from './seed/vendorEvent.seed';
import { VendorOrderSeed } from './seed/vendorOrder.seed';
import { shippingMethodSeed } from './seed/shippingMethod.seed';
import { CreditCardSeed } from './seed/creditCard.seed';
import { PaymentSeed } from './seed/payment.seed';
import { RoleSeed } from './seed/role.seeder';
import { VendorProductSeed } from './seed/vendorProduct.seed';

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
    // Disable foreign key checks temporarily
    await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

    // 1. First delete all junction tables and dependent records
    await this.prisma.vendorOrder.deleteMany();
    await this.prisma.orderStatusHistory.deleteMany();
    await this.prisma.orderItem.deleteMany();
    await this.prisma.payment.deleteMany();
    await this.prisma.vendorEvent.deleteMany();
    await this.prisma.vendorProduct.deleteMany();
    await this.prisma.wishlist.deleteMany();
    await this.prisma.favorite.deleteMany();
    await this.prisma.productCollection.deleteMany();
    await this.prisma.productReview.deleteMany();
    await this.prisma.productQuestion.deleteMany();
    await this.prisma.productImage.deleteMany();
    await this.prisma.discount.deleteMany();
    await this.prisma.cart.deleteMany();

    // 2. Then delete main order records
    await this.prisma.order.deleteMany();

    // 3. Delete user-related records
    await this.prisma.creditCard.deleteMany();
    await this.prisma.shippingMethod.deleteMany();
    await this.prisma.address.deleteMany();
    await this.prisma.notification.deleteMany();
    await this.prisma.contact.deleteMany();
    await this.prisma.refreshToken.deleteMany();
    await this.prisma.passwordChange.deleteMany();
    await this.prisma.auth.deleteMany();

    // 4. Now safe to delete products
    await this.prisma.product.deleteMany();

    // 5. Delete user subtypes
    await this.prisma.admin.deleteMany();
    await this.prisma.vendor.deleteMany();
    await this.prisma.customer.deleteMany();

    // 6. Delete junction tables
    await this.prisma.user_Role.deleteMany();

    // 7. Delete core entities
    await this.prisma.user.deleteMany();
    await this.prisma.role.deleteMany();

    // 8. Delete independent entities
    await this.prisma.category.deleteMany();
    await this.prisma.brand.deleteMany();
    await this.prisma.collection.deleteMany();

    // Reset auto-increment counters for all tables that were deleted
    await this.prisma.$executeRaw`ALTER TABLE \`VendorOrder\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`OrderStatusHistory\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`OrderItem\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Payment\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`VendorEvent\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`VendorProduct\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Wishlist\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Favorite\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`ProductCollection\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`ProductReview\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`ProductQuestion\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`ProductImage\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Discount\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Cart\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Order\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`CreditCard\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`ShippingMethod\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Address\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Notification\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Contact\` AUTO_INCREMENT = 1;`;
    // await this.prisma.$executeRaw`ALTER TABLE \`RefreshToken\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`PasswordChange\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Auth\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Product\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Admin\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Vendor\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Customer\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`user_Role\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`User\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Role\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Category\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Brand\` AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE \`Collection\` AUTO_INCREMENT = 1;`;

    // Re-enable foreign key checks
    await this.prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;
  }
  // Seed data to table
  private async seedData() {
    await RoleSeed.seed();
    await shippingMethodSeed.seed();
    await UserSeed.seed();
    await ProductSeeder.seed();
    await CreditCardSeed.seed();
    // await OrderSeed.seed();
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
