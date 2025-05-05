// ===========================================================================>> Core Library
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// ===========================================================================>> Custom Library
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ===================================================>> Get All Products
  async getProducts() {
    try {
      const products = await this.prisma.product.findMany({
        include: {
          category: true,
          brand: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return {
        data: products,
        message: 'Products retrieved successfully',
      };
    } catch (err) {
      throw new BadRequestException(`Could not fetch products: ${err.message}`);
    }
  }

  // ===================================================>> Get Single Product
  async getProduct(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          brand: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return {
        data: product,
        message: 'Product retrieved successfully',
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(`Could not fetch product: ${err.message}`);
    }
  }

  // ===================================================>> Create Product
  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    brand_id: number;
    is_new_arrival?: boolean;
    is_best_seller?: boolean;
  }) {
    try {
      // Validate category exists
      const category = await this.prisma.category.findUnique({
        where: { id: data.category_id },
      });
      if (!category) {
        throw new BadRequestException('Invalid category ID');
      }

      // Validate brand exists
      const brand = await this.prisma.brand.findUnique({
        where: { id: data.brand_id },
      });
      if (!brand) {
        throw new BadRequestException('Invalid brand ID');
      }

      const product = await this.prisma.product.create({
        data: {
          ...data,
          is_new_arrival: data.is_new_arrival || false,
          is_best_seller: data.is_best_seller || false,
          created_at: new Date(),
        },
        include: {
          category: true,
          brand: true,
        },
      });

      return {
        data: product,
        message: 'Product created successfully',
      };
    } catch (err) {
      throw new BadRequestException(`Could not create product: ${err.message}`);
    }
  }

  // ===================================================>> Update Product
  async updateProduct(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      category_id?: number;
      brand_id?: number;
      is_new_arrival?: boolean;
      is_best_seller?: boolean;
    },
  ) {
    try {
      // Check if product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });
      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Validate category if being updated
      if (data.category_id) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.category_id },
        });
        if (!category) {
          throw new BadRequestException('Invalid category ID');
        }
      }

      // Validate brand if being updated
      if (data.brand_id) {
        const brand = await this.prisma.brand.findUnique({
          where: { id: data.brand_id },
        });
        if (!brand) {
          throw new BadRequestException('Invalid brand ID');
        }
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...data,
          created_at: new Date(),
        },
        include: {
          category: true,
          brand: true,
        },
      });

      return {
        data: updatedProduct,
        message: 'Product updated successfully',
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(`Could not update product: ${err.message}`);
    }
  }

  // ===================================================>> Delete Product
  async deleteProduct(id: number) {
    try {
      // Check if product exists
      const product = await this.prisma.product.findUnique({
        where: { id },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.prisma.product.delete({
        where: { id },
      });

      return {
        message: 'Product deleted successfully',
      };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(`Could not delete product: ${err.message}`);
    }
  }
}