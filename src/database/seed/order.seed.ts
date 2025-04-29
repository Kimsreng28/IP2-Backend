import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

export class OrderSeed {
    private static prisma = new PrismaClient();
    private static saltRounds = 12;

    public static async seed() {
        try {
                await this.prisma.order.createMany({
                data: [
                ],
                skipDuplicates: true,
            });
      
            console.log('✅ Order seeded successfully');
        } catch (error) {
        console.error('🐞 Error seeding order:', error);
        throw error;
        } finally {
        await this.prisma.$disconnect();
        }
    }
  
}
