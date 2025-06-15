import { PrismaClient } from '@prisma/client';

export class VendorEventSeed {
    private static prisma = new PrismaClient();

    // public static async clear() {
    //     await this.prisma.vendorEvent.deleteMany({});
    //     console.log('🗑️ Cleared vendor events');
    // }

    public static async seed() {
        try {
            await this.prisma.$connect();

            // Sample vendor events data
            const currentDate = new Date();
            const vendorEvents = [
                {
                    vendor_id: 1, // Make sure this vendor exists
                    event_name: 'Summer Sale',
                    event_poster: 'summer-sale.jpg',
                    start_date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                    end_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                },
                {
                    vendor_id: 1,
                    event_name: 'Black Friday',
                    event_poster: 'black-friday.jpg',
                    start_date: new Date(currentDate.getFullYear(), 10, 23), // November 23
                    end_date: new Date(currentDate.getFullYear(), 10, 27)    // November 27
                },
                {
                    vendor_id: 1,
                    event_name: 'New Year Promotion',
                    event_poster: 'new-year.jpg',
                    start_date: new Date(currentDate.getFullYear(), 11, 20), // December 20
                    end_date: new Date(currentDate.getFullYear() + 1, 0, 10) // January 10 next year
                }
            ];

            await this.prisma.vendorEvent.createMany({
                data: vendorEvents,
                skipDuplicates: true,
            });

            console.log('✅ Vendor events seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding VendorEvents:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}