import { PrismaClient } from '@prisma/client';

export class ProductSeeder {
  private static prisma = new PrismaClient();

  public static async seed() {
    try {
      // ─────────────────────────────────────────
      // 1) Ensure categories and brands exist (upsert)
      // ─────────────────────────────────────────
      const categories = [
        { name: 'Electronics' },
        { name: 'Wearables' },
        { name: 'Fitness' },
      ];
      const brands = [
        { name: 'Sony' },
        { name: 'Apple' },
        { name: 'Nike' },
      ];

      const createdCategories = await Promise.all(
        categories.map((cat) =>
          this.prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
          })
        )
      );
      const createdBrands = await Promise.all(
        brands.map((brand) =>
          this.prisma.brand.upsert({
            where: { name: brand.name },
            update: {},
            create: brand,
          })
        )
      );

      // ─────────────────────────────────────────
      // 2) Now use full external URLs for each image
      // ─────────────────────────────────────────
      const externalImageUrls = [
        // Two sample Pexels images
        'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?cs=srgb&dl=pexels-pixabay-356056.jpg&fm=jpg',
        'https://images.pexels.com/photos/356057/pexels-photo-356057.jpeg?cs=srgb&dl=pexels-pixabay-356057.jpg&fm=jpg',
      ];

      // ─────────────────────────────────────────
      // 3) Prepare “products” array, each with those two URLs
      // ─────────────────────────────────────────
      const products = [
        {
          name: 'Wireless Bluetooth Headphones',
          description: 'Noise-cancelling wireless headphones',
          price: 79.99,
          stock: 50,
          category_id: createdCategories[0].id,
          brand_id: createdBrands[0].id,
          is_new_arrival: true,
          is_best_seller: false,
          created_at: new Date(),
          product_images: externalImageUrls.map((url) => ({
            image_url: url,
          })),
        },
        {
          name: 'Smartwatch Pro 2',
          description: 'Smart and lightweight',
          price: 129.99,
          stock: 30,
          category_id: createdCategories[1].id,
          brand_id: createdBrands[1].id,
          is_new_arrival: false,
          is_best_seller: true,
          created_at: new Date(),
          product_images: externalImageUrls.map((url) => ({
            image_url: url,
          })),
        },
        {
          name: 'UltraSoft Yoga Mat',
          description: 'Flexible and comfortable',
          price: 39.99,
          stock: 100,
          category_id: createdCategories[2].id,
          brand_id: createdBrands[2].id,
          is_new_arrival: false,
          is_best_seller: true,
          created_at: new Date(),
          product_images: externalImageUrls.map((url) => ({
            image_url: url,
          })),
        },
        {
          name: 'Ultra Sound',
          description: 'comfortable',
          price: 99.99,
          stock: 100,
          category_id: createdCategories[2].id,
          brand_id: createdBrands[2].id,
          is_new_arrival: false,
          is_best_seller: true,
          created_at: new Date(),
          product_images: externalImageUrls.map((url) => ({
            image_url: url,
          })),
        },
        {
          name: 'Table Lamp',
          description: 'Stylish and modern table lamp',
          price: 59.99,
          stock: 100,
          category_id: createdCategories[2].id,
          brand_id: createdBrands[2].id,
          is_new_arrival: false,
          is_best_seller: true,
          created_at: new Date(),
          product_images: externalImageUrls.map((url) => ({
            image_url: url,
          })),
        },
      ];

      // ─────────────────────────────────────────
      // 4) Create each product with its nested images
      // ─────────────────────────────────────────
      for (const prod of products) {
        await this.prisma.product.create({
          data: {
            name: prod.name,
            description: prod.description,
            price: prod.price,
            stock: prod.stock,
            category_id: prod.category_id,
            brand_id: prod.brand_id,
            is_new_arrival: prod.is_new_arrival,
            is_best_seller: prod.is_best_seller,
            created_at: prod.created_at,
            product_images: {
              create: prod.product_images.map((img) => ({
                image_url: img.image_url,
              })),
            },
          },
        });
      }

      console.log('✅ Products (and their external‐URL images) seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding products:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
