import { PrismaClient } from '@prisma/client';

export class AdminSeeder {
  private static prisma = new PrismaClient();

  public static async seed() {
    try {
      // Get all users with admin role
      const users = await this.prisma.user.findMany({
        where: { role_id: 3 },
        select: { id: true }
      });

      if (users.length === 0) {
        console.warn('⚠️ No vendor users found. Seed users first.');
        return;
      }
      const adminUser = users.map((user, index) => ({
        user_id: user.id,
        role_id: 'role_vendor',
        created_at: new Date(),
        updated_at: new Date()
      }));

      await this.prisma.admin.createMany({
        data: adminUser,
        skipDuplicates: true
      });

      console.log('✅ Admins seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding admins:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}