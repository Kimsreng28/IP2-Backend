import { PrismaClient } from '@prisma/client';

export class OrderSeed {
    private static prisma = new PrismaClient();

    // public static async clear() {
    //     await this.prisma.order.deleteMany({});
    //     console.log('🗑️ Cleared orders');
    // }

    public static async seed() {
        try {
            await this.prisma.$connect();
            const user = await this.prisma.user.findFirst();
            if (!user) throw new Error('No users exist in database');
            const vendor = await this.prisma.vendor.findFirst();
            const shippingMethod = await this.prisma.shippingMethod.findFirst();

            const currentDate = new Date();

            await this.prisma.order.createMany({
                data: [
                    {
                        user_id: user.id,
                        vendor_id: vendor?.id,
                        order_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), // 3 days ago
                        status: 'pending',
                        payment_status: 'unpaid',
                        total_amount: 100.50,
                        payment_method: 'credit_card',
                        shipping_address: '123 Street A',
                        shipping_method_id: shippingMethod?.id 
                    },
                    {
                        user_id: user.id,
                        vendor_id: vendor?.id,
                        order_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), // 2 days ago
                        status: 'shipped',
                        payment_status: 'paid',
                        total_amount: 200.00,
                        payment_method: 'paypal',
                        shipping_address: '456 Street B',
                        shipping_method_id: shippingMethod?.id 
                    },
                    {
                        user_id: user.id,
                        vendor_id: vendor?.id,
                        order_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), // 1 day ago
                        status: 'delivered',
                        payment_status: 'paid',
                        total_amount: 150.75,
                        payment_method: 'bank_transfer',
                        shipping_address: '789 Street C',
                        shipping_method_id: shippingMethod?.id 
                    },
                    {
                        user_id: user.id,
                        vendor_id: vendor?.id,
                        order_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                        status: 'shipped',
                        payment_status: 'paid',
                        total_amount: 200.00,
                        payment_method: 'paypal',
                        shipping_address: '456 Street B',
                        shipping_method_id: shippingMethod?.id
                    },
                    {
                        user_id: user.id,
                        vendor_id: vendor?.id,
                        order_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                        status: 'delivered',
                        payment_status: 'paid',
                        total_amount: 150.75,
                        payment_method: 'bank_transfer',
                        shipping_address: '789 Street C',
                        shipping_method_id: shippingMethod?.id
                    }
                ],
                skipDuplicates: true,
            });

            console.log('✅ Orders seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding Orders:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}