import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

export class UserSeed {
  private static prisma = new PrismaClient();
  private static saltRounds = 12;

  public static async seed() {
    try {
      // Clear existing data and reset auto-increments
      await this.clearAndReset();

      // Get roles
      const roles = await this.prisma.role.findMany();
      const adminRole = roles.find(r => r.slug === 'admin');
      const vendorRole = roles.find(r => r.slug === 'vendor');
      const customerRole = roles.find(r => r.slug === 'customer');

      if (!adminRole || !vendorRole || !customerRole) {
        throw new Error('Required roles not found in database');
      }

      // Create admin users
      const admin1 = await this.prisma.user.create({
        data: {
          first_name: 'KIM',
          last_name: 'Sreng',
          avatar: 'https://cdn-icons-png.flaticon.com/512/4794/4794939.png',
          email: 'kimsreng@gmail.com',
          password: await hash('admin123', this.saltRounds),
          role: 'ADMIN',
          email_verified: true,
        },
      });

      const admin2 = await this.prisma.user.create({
        data: {
          first_name: 'Admin',
          last_name: 'Two',
          avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          email: 'admin2@gmail.com',
          password: await hash('admin456', this.saltRounds),
          role: 'ADMIN',
          email_verified: true,
        },
      });

      // Create vendor users
      const vendor1 = await this.prisma.user.create({
        data: {
          first_name: 'Suvan',
          last_name: 'Net',
          email: 'net@gmail.com',
          avatar: 'https://cdn-icons-png.flaticon.com/512/4794/4794936.png',
          password: await hash('vendor123', this.saltRounds),
          role: 'VENDOR',
          email_verified: true,
        },
      });

      const vendor2 = await this.prisma.user.create({
        data: {
          first_name: 'Vendor',
          last_name: 'Two',
          email: 'vendor2@gmail.com',
          avatar: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
          password: await hash('vendor456', this.saltRounds),
          role: 'VENDOR',
          email_verified: true,
        },
      });

      // Create customer users
      const customer1 = await this.prisma.user.create({
        data: {
          first_name: 'Seng',
          last_name: 'hak',
          email: 'senghak@gmail.com',
          password: await hash('customer123', this.saltRounds),
          role: 'CUSTOMER',
          email_verified: true,
        },
      });

      const customer2 = await this.prisma.user.create({
        data: {
          first_name: 'Customer',
          last_name: 'Two',
          email: 'customer2@gmail.com',
          password: await hash('customer456', this.saltRounds),
          role: 'CUSTOMER',
          email_verified: true,
        },
      });

      // Create role associations for all users
      await this.prisma.user_Role.createMany({
        data: [
          // Admins
          { user_id: admin1.id, role_id: adminRole.id, creator_id: admin1.id, is_default: true },
          { user_id: admin2.id, role_id: adminRole.id, creator_id: admin1.id, is_default: true },

          // Vendors
          { user_id: vendor1.id, role_id: vendorRole.id, creator_id: admin1.id, is_default: true },
          { user_id: vendor2.id, role_id: vendorRole.id, creator_id: admin1.id, is_default: true },

          // Customers
          { user_id: customer1.id, role_id: customerRole.id, creator_id: admin1.id, is_default: true },
          { user_id: customer2.id, role_id: customerRole.id, creator_id: admin1.id, is_default: true },
        ],
      });

      // Create related records
      await this.prisma.admin.createMany({
        data: [
          { user_id: admin1.id },
          { user_id: admin2.id },
        ],
      });

      await this.prisma.vendor.createMany({
        data: [
          {
            user_id: vendor1.id,
            business_name: 'E-sale',
            business_email: 'Esal.info@gamil.com',
            business_phone: '123-456-7890',
          },
          {
            user_id: vendor2.id,
            business_name: 'Vendor Two Inc',
            business_email: 'vendor2@business.com',
            business_phone: '987-654-3210',
          },
        ],
      });

      await this.prisma.customer.createMany({
        data: [
          { user_id: customer1.id, loyalty_points: 0 },
          { user_id: customer2.id, loyalty_points: 100 }, // Example with some points
        ],
      });

      console.log('✅ Users seeded successfully (2 per role)');
    } catch (error) {
      console.error('🐞 Error seeding users:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private static async clearAndReset() {

    // Reset auto-increments for MySQL
    await this.prisma.$executeRaw`ALTER TABLE User AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE Admin AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE Vendor AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE Customer AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE user_Role AUTO_INCREMENT = 1;`;
  }
}