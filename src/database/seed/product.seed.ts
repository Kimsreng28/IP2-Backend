import { PrismaClient } from '@prisma/client';

export class ProductSeed {
    private static prisma = new PrismaClient();

    public static async clear() {
        await this.prisma.$transaction([
            this.prisma.product.deleteMany({}),
        ]);
        await this.prisma.$executeRaw`ALTER TABLE Product AUTO_INCREMENT = 1;`;
    }

    public static async seed() {
        try {
            await this.prisma.$connect();
            await this.clear();
            await this.prisma.product.createMany({
                data: [
                    {
                        name: "Wireless Mouse",
                        description: "Ergonomic wireless mouse with rechargeable battery.",
                        price: 25.99,
                        stock: 150,
                        category_id: 1,
                        brand_id: 1,
                        is_new_arrival: true,
                        is_best_seller: false,
                        created_at: new Date(),
                    },
                    {
                        name: "Bluetooth Headphones",
                        description: "Noise-cancelling Bluetooth headphones for immersive sound.",
                        price: 99.99,
                        stock: 50,
                        category_id: 2,
                        brand_id: 2,
                        is_new_arrival: false,
                        is_best_seller: true,
                        created_at: new Date(),
                    },
                    {
                        name: "Smartwatch",
                        description: "A fitness tracker with smartwatch functionalities.",
                        price: 199.99,
                        stock: 120,
                        category_id: 2,  
                        brand_id: 3,     
                        is_new_arrival: false,
                        is_best_seller: true,
                        created_at: new Date(),
                    },
                    {
                        name: "Laptop Stand",
                        description: "Adjustable laptop stand for ergonomic posture.",
                        price: 29.99,
                        stock: 80,
                        category_id: 2,  
                        brand_id: 1,     
                        is_new_arrival: false,
                        is_best_seller: false,
                        created_at: new Date(),
                    },
                    {
                        name: "Gaming Keyboard",
                        description: "RGB mechanical gaming keyboard with custom key switches.",
                        price: 79.99,
                        stock: 200,
                        category_id: 1,  
                        brand_id: 2,     
                        is_new_arrival: false,
                        is_best_seller: true,
                        created_at: new Date(),
                    },
                    {
                        name: "Portable Charger",
                        description: "10000mAh portable charger with fast charging support.",
                        price: 19.99,
                        stock: 300,
                        category_id: 1,  
                        brand_id: 3,     
                        is_new_arrival: true,
                        is_best_seller: false,
                        created_at: new Date(),
                    },
                    {
                        name: "4K Monitor",
                        description: "27-inch 4K UHD monitor with slim bezels.",
                        price: 349.99,
                        stock: 70,
                        category_id: 2,  
                        brand_id: 1,     
                        is_new_arrival: false,
                        is_best_seller: false,
                        created_at: new Date(),
                    },
                    {
                        name: "Portable Bluetooth Speaker",
                        description: "Water-resistant Bluetooth speaker with rich sound.",
                        price: 59.99,
                        stock: 90,
                        category_id: 3,  
                        brand_id: 1,     
                        is_new_arrival: true,
                        is_best_seller: false,
                        created_at: new Date(),
                    },
                    {
                        name: "Coffee Maker",
                        description: "Automatic drip coffee maker with programmable features.",
                        price: 49.99,
                        stock: 110,
                        category_id: 2,  
                        brand_id: 3,     
                        is_new_arrival: false,
                        is_best_seller: true,
                        created_at: new Date(),
                    },
                    {
                        name: "Electric Toothbrush",
                        description: "Smart electric toothbrush with multiple modes for better cleaning.",
                        price: 89.99,
                        stock: 60,
                        category_id: 1,
                        brand_id: 2,
                        is_new_arrival: false,
                        is_best_seller: false,
                        created_at: new Date(),
                    },
                ],
                // skipDuplicates not needed since we cleared first
            });

            console.log('✅ Products seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding Products:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}