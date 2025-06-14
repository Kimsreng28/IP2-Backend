import { PrismaClient } from '@prisma/client';

export class VendorRelatedSeeder {
    private static prisma = new PrismaClient();

    public static async clear() {
        await this.prisma.vendorOrder.deleteMany();
        await this.prisma.order.deleteMany();
        await this.prisma.vendorEvent.deleteMany();
        await this.prisma.vendorProduct.deleteMany();

        console.log('🗑️ Cleared vendor-related data');
    }

    public static async seed() {
        try {
            await this.prisma.$connect();

            // VendorProduct
            await this.prisma.vendorProduct.createMany({
                data: [
                    { vendor_id: 1, product_id: 1 },
                    { vendor_id: 1, product_id: 2 },
                    { vendor_id: 2, product_id: 3 },
                    { vendor_id: 2, product_id: 4 },
                    { vendor_id: 2, product_id: 5 },
                ],
                skipDuplicates: true,
            });

            // VendorEvent
            await this.prisma.vendorEvent.createMany({
                data: [
                    {
                        vendor_id: 1,
                        event_name: "E-sale Summer Bonanza",
                        event_poster: "poster1.jpg",
                        start_date: new Date('2025-06-15'),
                        end_date: new Date('2025-06-20'),
                    },
                    {
                        vendor_id: 2,
                        event_name: "Vendor Two Exclusive Launch",
                        event_poster: "poster2.jpg",
                        start_date: new Date('2025-06-18'),
                        end_date: new Date('2025-06-25'),
                    },
                ],
            });

            // Orders
            const order1 = await this.prisma.order.create({
                data: {
                    user_id: 5,
                    vendor_id: 1,
                    order_date: new Date('2025-06-05'),
                    status: "processing",
                    payment_status: "paid",
                    total_amount: 120.5,
                    payment_method: "credit_card",
                    shipping_address: "123 Main St, City A",
                },
            });

            const order2 = await this.prisma.order.create({
                data: {
                    user_id: 6,
                    vendor_id: 2,
                    order_date: new Date('2025-06-06'),
                    status: "shipped",
                    payment_status: "paid",
                    total_amount: 230.0,
                    payment_method: "paypal",
                    shipping_address: "456 Central Rd, City B",
                },
            });

            // VendorOrder
            await this.prisma.vendorOrder.createMany({
                data: [
                    {
                        vendor_id: 1,
                        order_id: order1.id,
                        status: "processing",
                        vendor_amount: 100.0,
                    },
                    {
                        vendor_id: 2,
                        order_id: order2.id,
                        status: "shipped",
                        vendor_amount: 200.0,
                    },
                ],
            });

            console.log('✅ Vendor-related data seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding vendor-related data:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}
