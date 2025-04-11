import { PrismaClient } from '@prisma/client';

export class RoleSeed {
  private static prisma = new PrismaClient();

  public static async seed() {
    try {
      await this.prisma.role.createMany({
        data: [
          { name: 'Admin', slug: 'admin' },
          { name: 'Vendor', slug: 'vendor' },
          { name: 'Customer', slug: 'customer' },
        ],
        skipDuplicates: true,
      });

      console.log('✅ Roles seeded successfully');
    } catch (error) {
      console.error('🐞 Error seeding roles:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
