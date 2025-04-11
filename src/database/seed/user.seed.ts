import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

export class UserSeed {
  private static prisma = new PrismaClient();
  private static saltRounds = 12;

  public static async seed() {
    try {
      // Create or update admin user
      const admin = await this.prisma.user.upsert({
        where: { email: 'kimsreng@gmail.com' },
        update: {}, // No update logic needed here
        create: {
          first_name: 'KIM',
          last_name: 'Sreng',
          email: 'kimsreng@gmail.com',
          password: await hash('admin123', this.saltRounds),
          role: 'ADMIN',
          email_verified: true,
        },
      });

      // Create or update vendor user
      const vendor = await this.prisma.user.upsert({
        where: { email: 'net@gmail.com' },
        update: {},
        create: {
          first_name: 'Suvan',
          last_name: 'Net',
          email: 'net@gmail.com',
          password: await hash('vendor123', this.saltRounds),
          role: 'VENDOR',
          email_verified: true,
        },
      });

      // Create or update customer user
      const customer = await this.prisma.user.upsert({
        where: { email: 'senghak@gmail.com' },
        update: {},
        create: {
          first_name: 'Seng',
          last_name: 'hak',
          email: 'senghak@gmail.com',
          password: await hash('customer123', this.saltRounds),
          role: 'CUSTOMER',
          email_verified: true,
        },
      });

      // Create role records (skip duplicates if they already exist)
      await this.prisma.user_Role.createMany({
        data: [
          { user_id: admin.id, role_id: 1, creator_id: 1, is_default: true },
          { user_id: vendor.id, role_id: 2, creator_id: 1, is_default: true },
          { user_id: customer.id, role_id: 3, creator_id: 1, is_default: true },
        ],
        skipDuplicates: true,
      });

      // Create or ignore admin, vendor, customer extra records
      await this.prisma.admin.upsert({
        where: { user_id: admin.id },
        update: {},
        create: { user_id: admin.id, role: 'super_admin' },
      });

      await this.prisma.vendor.upsert({
        where: { user_id: vendor.id },
        update: {},
        create: {
          user_id: vendor.id,
          business_name: 'E-sale',
          business_email: 'Esal.info@gamil.com',
          business_phone: '123-456-7890',
        },
      });

      await this.prisma.customer.upsert({
        where: { user_id: customer.id },
        update: {},
        create: { user_id: customer.id, loyalty_points: 0 },
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
