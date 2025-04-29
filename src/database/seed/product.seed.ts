import { PrismaClient } from '@prisma/client';
// import { faker } from '@faker-js/faker';

export class ProductSeeder {
    private static prisma = new PrismaClient();

    public static async seed() {
        try {
            const categories = [
                { name: 'Electronics' },
                { name: 'Wearables' },
                { name: 'Fitness' }
            ];

            const brands = [
                { name: 'Sony' },
                { name: 'Apple' },
                { name: 'Nike' }
            ];

            const createdCategories = await Promise.all(
                categories.map(cat =>
                    this.prisma.category.upsert({
                        where: { name: cat.name },
                        update: {}, // Nothing to update if it exists
                        create: cat
                    })
                )
            );

            const createdBrands = await Promise.all(
                brands.map(brand =>
                    this.prisma.brand.upsert({
                        where: { name: brand.name },
                        update: {},
                        create: brand
                    })
                )
            );


            // await this.prisma.product.createMany({
            //     data: []
            // }); 

            const products = [
                {
                    name: 'Wireless Bluetooth Headphones',
                    description: 'Noise-cancelling wireless headphones',
                    price: 79.99,
                    stock: 50,
                    category_id: createdCategories[0].id, // Replace with a valid category_id
                    brand_id: createdBrands[0].id,    // Replace with a valid brand_id
                    is_new_arrival: true,
                    is_best_seller: false,
                    created_at: new Date()
                },
                {
                    name: 'Smartwatch Pro 2',
                    description: 'Smart and lightweight',
                    price: 129.99,
                    stock: 30,
                    category_id: createdCategories[1].id, // Replace with a valid category_id
                    brand_id: createdBrands[1].id,    // Replace with a valid brand_id
                    is_new_arrival: false,
                    is_best_seller: true,
                    created_at: new Date()
                },
                {
                    name: 'UltraSoft Yoga Mat',
                    description: 'Flexible and comfortable',
                    price: 39.99,
                    stock: 100,
                    category_id: createdCategories[2].id, // Replace with a valid category_id
                    brand_id: createdBrands[2].id,    // Replace with a valid brand_id
                    is_new_arrival: false,
                    is_best_seller: true,
                    created_at: new Date()
                }
            ];

            await this.prisma.category.createMany({
                data: categories,
                skipDuplicates: true
            });

            await this.prisma.brand.createMany({
                data: brands,
                skipDuplicates: true
            });

            await this.prisma.product.createMany({
                data: products,
                skipDuplicates: true
            });

            console.log('✅ Products seeded successfully');
        } catch (error) {
            console.error('❌ Error seeding products:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}
