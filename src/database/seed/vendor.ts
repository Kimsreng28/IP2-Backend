import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Seed vendor_products
    await prisma.vendorProduct.createMany({
        data: [
            { vendor_id: 1, product_id: 1 },
            { vendor_id: 1, product_id: 2 },
            { vendor_id: 2, product_id: 3 },
            { vendor_id: 2, product_id: 4 },
            { vendor_id: 2, product_id: 5 },
        ],
    });

    // Seed vendor_events
    await prisma.vendorEvent.createMany({
        data: [
            {
                vendor_id: 1,
                event_name: 'E-sale Summer Bonanza',
                event_poster: 'poster1.jpg',
                start_date: new Date('2025-06-15'),
                end_date: new Date('2025-06-20'),
            },
            {
                vendor_id: 2,
                event_name: 'Vendor Two Exclusive Launch',
                event_poster: 'poster2.jpg',
                start_date: new Date('2025-06-18'),
                end_date: new Date('2025-06-25'),
            },
        ],
    });

    // Seed orders
    const order1 = await prisma.order.create({
        data: {
            user_id: 5,
            vendor_id: 1,
            order_date: new Date('2025-06-05'),
            status: 'processing',
            payment_status: 'paid',
            total_amount: 120.5,
            payment_method: 'credit_card',
            shipping_address: '123 Main St, City A',
        },
    });

    const order2 = await prisma.order.create({
        data: {
            user_id: 6,
            vendor_id: 2,
            order_date: new Date('2025-06-06'),
            status: 'shipped',
            payment_status: 'paid',
            total_amount: 230.0,
            payment_method: 'paypal',
            shipping_address: '456 Central Rd, City B',
        },
    });

    // Seed vendor_orders
    await prisma.vendorOrder.createMany({
        data: [
            {
                vendor_id: 1,
                order_id: order1.id,
                status: 'processing',
                vendor_amount: 100.0,
            },
            {
                vendor_id: 2,
                order_id: order2.id,
                status: 'shipped',
                vendor_amount: 200.0,
            },
        ],
    });

    console.log('✅ Seed data inserted successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Error while seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
