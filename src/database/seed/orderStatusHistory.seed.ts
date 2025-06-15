import { PrismaClient } from '@prisma/client';

export class OrderStatusHistorySeed {
    private static prisma = new PrismaClient();

    // public static async clear() {
    //     await this.prisma.orderStatusHistory.deleteMany({});
    //     console.log('🗑️ Cleared order status history');
    // }

    public static async seed() {
        try {
            await this.prisma.$connect();

            await this.prisma.orderStatusHistory.createMany({
                data: [
                    { order_id: 1, status: 'pending' },
                    { order_id: 2, status: 'shipped' },
                    { order_id: 3, status: 'delivered' },
                ],
                skipDuplicates: true,
            });

            console.log('✅ OrderStatusHistory seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding OrderStatusHistory:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}
