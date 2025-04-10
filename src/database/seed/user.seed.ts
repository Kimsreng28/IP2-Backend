import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

export class UserSeeder {
  private static prisma = new PrismaClient();

  public static async seed() {
    try {
      // Hash passwords using proper bcrypt import
      const password = await bcrypt.hash('Password@123', 10);
      
      // Create users with different roles
      const users = [
        // Super Admin user
        {
          first_name: 'Admin',
          last_name: 'User',
          display_name: 'admin_user',
          email: 'admin@example.com',
          password,
          role_id: 3,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        // Vendor user
        {
          first_name: 'Vendor',
          last_name: 'Owner',
          display_name: 'vendor_owner',
          email: 'vendor@example.com',
          password,
          role_id: 2,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        // Customer user
        {
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'john_doe',
          email: 'customer@example.com',
          password,
          role_id: 1,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        // Additional test users
        ...Array.from({ length: 7 }).map((_, i) => ({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          display_name: faker.internet.userName(),
          email: faker.internet.email(),
          password,
          role_id: 1,
          status: faker.helpers.arrayElement(['active', 'inactive']),
          created_at: new Date(),
          updated_at: new Date()
        }))
      ];

      await this.prisma.user.createMany({
        data: users,
        skipDuplicates: true
      });

      console.log('✅ Users seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding users:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}