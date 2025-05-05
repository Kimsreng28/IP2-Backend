
import { ProductSeeder } from './product.seed';

import { BrandSeed } from './brand.seed';
import { CategorySeed } from './category.seed';
import { ProductSeed } from './product.seed';

import { RoleSeed } from './role.seeder';
import { UserSeed } from './user.seed';

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed roles first
    await RoleSeed.seed();

    // Then seed users
    await UserSeed.seed();
    await CategorySeed.seed();
    await BrandSeed.seed()

    await ProductSeed.seed();

    await ProductSeeder.seed();

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('🔥 Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
