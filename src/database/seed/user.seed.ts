import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

export class UserSeed {
  private static prisma = new PrismaClient();
  private static saltRounds = 12;

  public static async seed() {
    try {
      // Create admin user
      const admin = await this.prisma.user.create({
        data: {
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          password: await hash('admin123', this.saltRounds),
          role: 'ADMIN',
          email_verified: true,
        },
      });

      // Create vendor user
      const vendor = await this.prisma.user.create({
        data: {
          first_name: 'Vendor',
          last_name: 'User',
          email: 'vendor@example.com',
          password: await hash('vendor123', this.saltRounds),
          role: 'VENDOR',
          email_verified: true,
        },
      });

      // Create customer user
      const customer = await this.prisma.user.create({
        data: {
          first_name: 'Customer',
          last_name: 'User',
          email: 'customer@example.com',
          password: await hash('customer123', this.saltRounds),
          role: 'CUSTOMER',
          email_verified: true,
        },
      });

      // Create corresponding role records
      await this.prisma.user_Role.createMany({
        data: [
          { user_id: admin.id, role_id: 1, creator_id: 1, is_default: true },
          { user_id: vendor.id, role_id: 2, creator_id: 1, is_default: true },
          { user_id: customer.id, role_id: 3, creator_id: 1, is_default: true },
        ],
        skipDuplicates: true,
      });

      // Create related records (Admin, Vendor, Customer)
      await this.prisma.admin.create({
        data: { user_id: admin.id, role: 'super_admin' },
      });

      await this.prisma.vendor.create({
        data: {
          user_id: vendor.id,
          business_name: 'Example Vendor',
          business_email: 'vendor@example.com',
          business_phone: '1234567890',
        },
      });

      await this.prisma.customer.create({
        data: { user_id: customer.id, loyalty_points: 0 },
      });

      console.log('✅ Users seeded successfully');
    } catch (error) {
      console.error('🐞 Error seeding users:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
