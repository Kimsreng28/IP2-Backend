import { PrismaClient } from '@prisma/client';

export class shippingMethodSeed {
    private static prisma = new PrismaClient();

    // public static async clear() {
    //     await this.prisma.shippingMethod.deleteMany({});
    //     console.log('🗑️ Cleared shipping methods');
    // }

    public static async seed() {
        try {
            await this.prisma.$connect();

            await this.prisma.shippingMethod.createMany({
                data: [
                    { 
                        name: 'Standard Shipping',
                        cost: 4.99,
                        delivery_time: '3-5 business days'
                    },
                    { 
                        name: 'Express Shipping',
                        cost: 9.99,
                        delivery_time: '1-2 business days'
                    },
                    { 
                        name: 'Overnight Shipping',
                        cost: 19.99,
                        delivery_time: 'Next business day'
                    }
                ],
                skipDuplicates: true,
            });

            console.log('✅ Shipping methods seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding Shipping Methods:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}