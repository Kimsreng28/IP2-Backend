import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export class VendorSeeder {
  private static prisma = new PrismaClient();

  public static async seed() {
    try {
      // Get all users with vendor role
      const vendorUsers = await this.prisma.user.findMany({
        where: { role_id: 2 },
        select: { id: true }
      });

      if (vendorUsers.length === 0) {
        console.warn('⚠️ No vendor users found. Seed users first.');
        return;
      }

      const vendors = vendorUsers.map((user, index) => ({
        user_id: user.id,
        role_id: 'role_vendor',
        business_name: faker.company.name(),
        business_email: faker.internet.email(),
        business_phone: faker.phone.number(),
        status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
        created_at: new Date(),
        updated_at: new Date()
      }));

      await this.prisma.vendor.createMany({
        data: vendors,
        skipDuplicates: true
      });

      console.log('✅ Vendors seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding vendors:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}