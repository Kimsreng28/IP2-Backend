import { ProductSeeder } from './product.seed';
import { RoleSeed } from './role.seeder';
import { UserSeed } from './user.seed';

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed roles first
    await RoleSeed.seed();

    // Then seed users
    await UserSeed.seed();

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
