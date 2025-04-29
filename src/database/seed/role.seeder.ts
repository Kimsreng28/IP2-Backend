import { PrismaClient } from '@prisma/client';

export class RoleSeed {
  private static prisma = new PrismaClient();

  public static async seed() {
    try {
      await this.clearAndReset();

      await this.prisma.role.createMany({
        data: [
          { name: 'Admin', slug: 'admin' },
          { name: 'Vendor', slug: 'vendor' },
          { name: 'Customer', slug: 'customer' },
        ],
      });

      console.log('✅ Roles seeded successfully');
    } catch (error) {
      console.error('🐞 Error seeding roles:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private static async clearAndReset() {
    await this.prisma.user_Role.deleteMany();
    await this.prisma.role.deleteMany();
    await this.prisma.$executeRaw`ALTER TABLE Role AUTO_INCREMENT = 1;`;
  }
}