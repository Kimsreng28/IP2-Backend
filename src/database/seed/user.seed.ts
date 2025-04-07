import { PrismaClient } from '@prisma/client';

export class UserSeed {
  private static prisma = new PrismaClient();

  public static seed = async () => {
    try {
      const result = await UserSeed.prisma.user.createMany({
        data: [],
      });

      console.log(
        `Users seeded successfully. ${result.count} records created.`.green,
      );
    } catch (error) {
      console.error('🐞 Error seeding users:', error);
    } finally {
      await UserSeed.prisma.$disconnect();
    }
  };
}
