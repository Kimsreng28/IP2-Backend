import { PrismaClient } from '@prisma/client';

export class ProductSeeder {
  private static prisma = new PrismaClient();

  public static async seed() {
    try {
      // ─────────────────────────────────────────
      // 1) Seed Categories and Brands
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
      // 2) 13 Images (image1.png to image13.png)
      // ─────────────────────────────────────────
      const externalImageUrls = Array.from(
        { length: 13 },
        (_, i) => `image${i + 1}.png`
      );

      // ─────────────────────────────────────────
      // 3) Helper to get 4 images per product (rotating)
      // ─────────────────────────────────────────
      function getProductImages(startIndex: number): { image_url: string }[] {
        return Array.from({ length: 4 }, (_, i) => ({
          image_url: externalImageUrls[(startIndex + i) % externalImageUrls.length],
        }));
      }

      // ─────────────────────────────────────────
      // 4) Generate 13 Products
      // ─────────────────────────────────────────
      const products = Array.from({ length: 13 }, (_, i) => ({
        name: `Product ${i + 1}`,
        description: `Description for Product ${i + 1}`,
        price: 49.99 + i * 5,
        stock: 50 + i * 10,
        category_id: createdCategories[i % createdCategories.length].id,
        brand_id: createdBrands[i % createdBrands.length].id,
        is_new_arrival: i % 3 === 0,
        is_best_seller: i % 2 === 0,
        created_at: new Date(),
        product_images: getProductImages(i),
      }));

      // ─────────────────────────────────────────
      // 5) Create all products with nested images
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
              create: prod.product_images,
            },
          },
        });
      }

      console.log('✅ 13 Products seeded successfully with rotating 4-image sets');
    } catch (error) {
      console.error('❌ Error seeding products:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
