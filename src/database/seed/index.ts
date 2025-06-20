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
    console.log('')
    // 1. First seed fundamental entities
    await RoleSeed.seed();
    await shippingMethodSeed.seed();
    await CategorySeed.seed();
    await BrandSeed.seed();

    // 2. Then seed users (depends on roles)
    await UserSeed.seed();

    // 3. Then seed products (depends on categories and brands)
    await ProductSeeder.seed();
    await shippingMethodSeed.seed();

    // 4. Then seed entities that depend on users
    await CreditCardSeed.seed(); // Needs users
    await OrderSeed.seed(); // Needs users
    await VendorProductSeed.seed(); // Needs users and products

    // 5. Finally seed entities that depend on orders
    await PaymentSeed.seed(); // Needs orders and users
    await OrderItemSeed.seed(); // Needs orders and products
    await OrderStatusHistorySeed.seed(); // Needs orders
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