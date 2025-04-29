import { PrismaClient } from '@prisma/client';

export class BrandSeed {
    private static prisma = new PrismaClient();
    public static async clear() {
        await this.prisma.brand.deleteMany({});
        console.log('🗑️ Cleared brands');
    }

    public static async seed() {
        try {
            await this.prisma.$connect();

            await this.prisma.brand.createMany({
                data: [
                { id: 1, name: 'Brand A' },
                { id: 2, name: 'Brand B' },
                { id: 3, name: 'Brand C' },
                { id: 4, name: 'Brand D' },
                { id: 5, name: 'Brand E' },
                ],
                skipDuplicates: true,
            });

            console.log('✅ Brands seeded successfully');
            } catch (error) {
            console.error('🐞 Error seeding Brands:', error);
            throw error;
            } finally {
            await this.prisma.$disconnect();
        }
    }
}
