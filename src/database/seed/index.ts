import { ProductSeeder } from './product.seed';

import { BrandSeed } from './brand.seed';
import { CategorySeed } from './category.seed';

import { RoleSeed } from './role.seeder';
import { UserSeed } from './user.seed';
import { VendorProductSeed } from './vendorProduct.seed';
import { OrderSeed } from './order.seed';
import { OrderItemSeed } from './orderItem.seed';
import { OrderStatusHistorySeed } from './orderStatusHistory.seed';
import { VendorEventSeed } from './vendorEvent.seed';
import { VendorOrderSeed } from './vendorOrder.seed';
import { shippingMethodSeed } from './shippingMethod.seed';
import { CreditCardSeed } from './creditCard.seed';
import { PaymentSeed } from './payment.seed';

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed roles first
    await RoleSeed.seed();

    // Then seed users
    await OrderSeed.seed();
    await shippingMethodSeed.seed();
    await UserSeed.seed();
    await CategorySeed.seed();
    await BrandSeed.seed();

    await ProductSeeder.seed();

    await VendorProductSeed.seed();
    await CreditCardSeed.seed();
    await PaymentSeed.seed();
    await OrderItemSeed.seed();
    await OrderStatusHistorySeed.seed();
    await VendorEventSeed.seed();
    await VendorOrderSeed.seed();

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('🔥 Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
