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

      // Create users
      const admin = await this.prisma.user.create({
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

      const vendor = await this.prisma.user.create({
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

      const customer = await this.prisma.user.create({
        data: {
          first_name: 'Seng',
          last_name: 'hak',
          email: 'senghak@gmail.com',
          password: await hash('customer123', this.saltRounds),
          role: 'CUSTOMER',
          email_verified: true,
        },
      });

      // Create role associations
      await this.prisma.user_Role.createMany({
        data: [
          { user_id: admin.id, role_id: adminRole.id, creator_id: admin.id, is_default: true },
          { user_id: vendor.id, role_id: vendorRole.id, creator_id: admin.id, is_default: true },
          { user_id: customer.id, role_id: customerRole.id, creator_id: admin.id, is_default: true },
        ],
      });

      // Create related records
      await this.prisma.admin.create({
        data: { user_id: admin.id, role: 'super_admin' },
      });

      await this.prisma.vendor.create({
        data: {
          user_id: vendor.id,
          business_name: 'E-sale',
          business_email: 'Esal.info@gamil.com',
          business_phone: '123-456-7890',
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

  private static async clearAndReset() {
    // Delete in correct order to maintain referential integrity
    await this.prisma.admin.deleteMany();
    await this.prisma.vendor.deleteMany();
    await this.prisma.customer.deleteMany();
    await this.prisma.user_Role.deleteMany();
    await this.prisma.user.deleteMany();
    
    // Reset auto-increments for MySQL
    await this.prisma.$executeRaw`ALTER TABLE User AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE Admin AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE Vendor AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE Customer AUTO_INCREMENT = 1;`;
    await this.prisma.$executeRaw`ALTER TABLE user_Role AUTO_INCREMENT = 1;`;
  }
}