import { PrismaClient } from '@prisma/client';

export class RoleSeeder {
  private static prisma = new PrismaClient();

  public static async seed() {
    try {
      const roles = [
        { name: "Customer", code: "CUSTOMER", description: "Regular customer role" },
        { name: "Vendor", code: "VENDOR", description: "Product vendor/seller" },
        { name: "Admin", code: "ADMIN", description: "System administrator" },
        { name: "Super Admin", code: "SUPER_ADMIN", description: "Full system access" }
      ];

      await this.prisma.role.createMany({ data: roles });
      console.log('✅ Roles seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding roles:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}