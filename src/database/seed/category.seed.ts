import { PrismaClient } from '@prisma/client';

export class CategorySeed {
    private static prisma = new PrismaClient();

    public static async clear() {
        await this.prisma.category.deleteMany({});
        console.log('🗑️ Cleared categories');
    }
    public static async seed() {
        try {
            await this.prisma.$connect();

            await this.prisma.category.createMany({
                data: [
                { id: 1, name: 'Accessories' },
                { id: 2, name: 'Audio' },
                { id: 3, name: 'Wearables' },
                { id: 4, name: 'Office' },
                { id: 5, name: 'Gaming' },
                { id: 6, name: 'Power Banks' },
                { id: 7, name: 'Monitors' },
                { id: 8, name: 'Speakers' },
                { id: 9, name: 'Kitchen Appliances' },
                { id: 10, name: 'Personal Care' },
                ],
                skipDuplicates: true,
            });

            console.log('✅ Categories seeded successfully');
            } catch (error) {
            console.error('🐞 Error seeding Categories:', error);
            throw error;
            } finally {
            await this.prisma.$disconnect();
        }
    }
}
