import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

export class UserSeed {
  private static prisma = new PrismaClient();
  private static saltRounds = 10; // Define salt rounds for bcrypt

  public static seed = async () => {
    try {
      // Step 1: Seed sex
      await UserSeed.prisma.sex.createMany({
        data: [
          { name: 'Male' },
          { name: 'Female' },
        ],
        skipDuplicates: true, // Avoid errors if the records already exist
      });

      // Step 2: Seed roles
      await UserSeed.prisma.role.createMany({
        data: [
          { name: 'Client', slug: 'client' },
          { name: 'Admin', slug: 'admin' },
          { name: 'Vendor', slug: 'vendor' },
        ],
        skipDuplicates: true, // Avoid errors if the records already exist
      });

      // Step 4: Seed users with hashed passwords
      await UserSeed.prisma.user.createMany({
        data: [
          {
            name: 'Chan Suvannet',
            avatar: 'avatar',
            email: 'chansuvanet@gmail.com',
            phone: '0889566929',
            password: await hash('123456', UserSeed.saltRounds),
            sex_id: 1,
          },
          {
            name: 'Hai Kimsreng',
            avatar: 'avatar',
            email: 'haikimsreng@gmail.com',
            phone: '0987654321',
            password: await hash('123456', UserSeed.saltRounds),
            sex_id: 2,
          },
        ],
        skipDuplicates: true, // Avoid duplicate user creation
      });

      // Step 5: Seed user roles
      await UserSeed.prisma.user_Role.createMany({
        data: [
          { user_id: 1, role_id: 1, creator_id: 1, is_default: true },
          { user_id: 1, role_id: 3, creator_id: 1, is_default: false },
          { user_id: 1, role_id: 2, creator_id: 1, is_default: false },
          { user_id: 2, role_id: 1, creator_id: 1, is_default: true },
        ],
        skipDuplicates: true,
      });

      console.log(`✅ Users and roles seeded successfully.`);

    } catch (error) {
      console.error('🐞 Error seeding users:', error);
    } finally {
      await UserSeed.prisma.$disconnect();
    }
  };
}
