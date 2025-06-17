import { PrismaClient } from '@prisma/client';

export class PaymentSeed {
    private static prisma = new PrismaClient();
    
    // public static async clear() {
    //     await this.prisma.payment.deleteMany({});
    //     console.log('🗑️ Cleared payments');
    // }

    public static async seed() {
        try {
            await this.prisma.$connect();

            // First ensure there are required relations
            // const [users, orders, creditCards] = await Promise.all([
            //     this.prisma.user.findMany(),
            //     this.prisma.order.findMany(),
            //     this.prisma.creditCard.findMany()
            // ]);

            // if (users.length === 0 || orders.length === 0) {
            //     throw new Error('Need at least one user and one order to seed payments');
            // }

            await this.prisma.payment.createMany({
                data: [
                    // Payment with credit card
                    {
                        order_id: 1,
                        user_id: 5,
                        credit_card_id: 1,
                        payment_method: 'credit_card',
                        payment_gateway: 'stripe',
                        transaction_id: `txn_${Date.now()}_1`,
                        status: 'completed'
                    },
                    // Payment without credit card (e.g., PayPal)
                    {
                        order_id: 2,
                        user_id: 5,
                        payment_method: 'paypal',
                        payment_gateway: 'paypal',
                        transaction_id: `txn_${Date.now()}_2`,
                        status: 'completed'
                    },
                    // Failed payment
                    {
                        order_id: 3,
                        user_id: 6,
                        credit_card_id: 2,
                        payment_method: 'credit_card',
                        payment_gateway: 'stripe',
                        transaction_id: `txn_${Date.now()}_3`,
                        status: 'failed'
                    }
                ],
                skipDuplicates: true,
            });

            console.log('✅ Payments seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding Payments:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}