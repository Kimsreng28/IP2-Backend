import { PrismaClient } from '@prisma/client';

export class ProductSeeder {
  private static prisma = new PrismaClient();

  public static async clean() {
    try {
      // Delete in order of foreign key dependencies
      await this.prisma.productImage.deleteMany();
      await this.prisma.product.deleteMany();
      console.log('🧹 Cleaned product data');
    } catch (error) {
      console.error('❌ Error cleaning products:', error);
      throw error;
    }
  }

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
      // 2) 13 image URLs (image1.png to image13.png)
      // ─────────────────────────────────────────
      const externalImageUrls = Array.from(
        { length: 13 },
        (_, i) => `image${i + 1}.png`
      );

      // ─────────────────────────────────────────
      // 3) Helper to get one image per product
      // ─────────────────────────────────────────
      function getProductImage(index: number): string {
        return externalImageUrls[index];
      }

      // ─────────────────────────────────────────
      // 4) Create 13 products, each with one image
      // ─────────────────────────────────────────
      for (let i = 0; i < 13; i++) {
        const createdProduct = await this.prisma.product.create({
          data: {
            name: `Product ${i + 1}`,
            description: `Description for Product ${i + 1}`,
            price: 49.99 + i * 5,
            stock: 50 + i * 10,
            category_id: createdCategories[i % createdCategories.length].id,
            brand_id: createdBrands[i % createdBrands.length].id,
            is_new_arrival: i % 3 === 0,
            is_best_seller: i % 2 === 0,
            created_at: new Date(),
          },
        });

        // Create exactly one image for the product
        await this.prisma.productImage.create({
          data: {
            image_url: getProductImage(i),
            product_id: createdProduct.id,
          },
        });
      }

      console.log('✅ 13 Products seeded successfully with one unique image each');
    } catch (error) {
      console.error('❌ Error seeding products:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
