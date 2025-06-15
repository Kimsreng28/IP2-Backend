import { PrismaClient } from '@prisma/client';

export class OrderItemSeed {
    private static prisma = new PrismaClient();

    // public static async clear() {
    //     await this.prisma.orderItem.deleteMany({});
    //     console.log('🗑️ Cleared order items');
    // }

    public static async seed() {
        try {
            await this.prisma.$connect();

            // Sample order items data
            const orderItems = [
                // Order 1 items
                {
                    order_id: 1,
                    product_id: 1,
                    quantity: 2,
                    price: 89.99
                },
                {
                    order_id: 1,
                    product_id: 2,
                    quantity: 1,
                    price: 20.00
                },
                {
                    order_id: 1,
                    product_id: 3,
                    quantity: 1,
                    price: 349.50
                },
                {
                    order_id: 2,
                    product_id: 4,
                    quantity: 1,
                    price: 89.95
                },
                {
                    order_id: 2,
                    product_id: 5,
                    quantity: 3,
                    price: 15.99
                },
                {
                    order_id: 3,
                    product_id: 6,
                    quantity: 2,
                    price: 24.50
                }
            ];

            await this.prisma.orderItem.createMany({
                data: orderItems,
                skipDuplicates: true,
            });

            console.log('✅ Order items seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding OrderItems:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}