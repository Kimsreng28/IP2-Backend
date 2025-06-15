import { PrismaClient } from '@prisma/client';

export class VendorOrderSeed {
    private static prisma = new PrismaClient();

    // public static async clear() {
    //     await this.prisma.vendorOrder.deleteMany({});
    //     console.log('🗑️ Cleared vendor orders');
    // }

    public static async seed() {
        try {
            await this.prisma.$connect();

            // Sample vendor orders data
            const currentDate = new Date();
            const vendorOrders = [
                {
                    vendor_id: 1,    // Must exist in Vendor table
                    order_id: 1,     // Must exist in Order table
                    status: "completed",
                    vendor_amount: 199.99,
                    created_at: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                    updated_at: new Date(currentDate.getFullYear(), currentDate.getMonth(), 3)
                },
                {
                    vendor_id: 1,
                    order_id: 2,
                    status: "shipped",
                    vendor_amount: 349.50,
                    created_at: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
                    updated_at: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7)
                },
                {
                    vendor_id: 1,
                    order_id: 3,
                    status: "pending",
                    vendor_amount: 89.95,
                    created_at: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
                    updated_at: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10)
                }
            ];

            await this.prisma.vendorOrder.createMany({
                data: vendorOrders,
                skipDuplicates: true,
            });

            console.log('✅ Vendor orders seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding VendorOrders:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}