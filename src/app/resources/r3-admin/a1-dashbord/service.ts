// ===========================================================================>> Core Library
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

// ===========================================================================>> Custom Library
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ===================================================>> Get All Products
  async getData(){
    const products = await this.getProducts()
    const users = await this.getUsers()
    const sales = await this.getOrder()

    return{
      products,
      users,
      sales
    }
  }
  async getProducts() {
    try {
      // Fetch products with related category and brand
      const productsPromise = this.prisma.product.findMany({
        include: {
          category: true,
          brand: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Get product order statistics (sum of quantities)
      const orderStatsPromise = this.prisma.orderItem.groupBy({
        by: ['product_id'],
        _sum: { quantity: true },
      });

      // Count total products
      const countPromise = this.prisma.product.count();

      // Await all promises concurrently
      const [products, orderStats, totalCount] = await Promise.all([
        productsPromise,
        orderStatsPromise,
        countPromise
      ]);

      // Create a map for quick lookup of order quantities
      const orderQuantities = new Map(
        orderStats.map(stat => [stat.product_id, stat._sum.quantity || 0])
      );

      // Add total_ordered to each product
      const productsWithOrderCount = products.map(product => ({
        ...product,
        total_ordered: orderQuantities.get(product.id) || 0,
      }));

      return {
        data: productsWithOrderCount,
        totalCount,
      };
    } catch (err) {
      throw new BadRequestException(`Could not fetch products: ${err.message}`);
    }
  }


  async getUsers() {
    try {
      // Fetch vendor users
      const usersPromise = this.prisma.user.findMany({
        where: { role: RoleEnum.VENDOR },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          role: true,
          status: true,
          created_at: true,
          updated_at: true,
          avatar: true,
        },
      });

      // Count total vendors
      const countPromise = this.prisma.user.count({
        where: { role: RoleEnum.VENDOR },
      });

      // Get last updated timestamp
      const lastUpdatedPromise = this.prisma.user.aggregate({
        _max: { updated_at: true },
        where: { role: RoleEnum.VENDOR }, // Optional: limit to vendors only
      });

      // Await all promises in parallel
      const [users, totalCount, lastUpdated] = await Promise.all([
        usersPromise,
        countPromise,
        lastUpdatedPromise,
      ]);

      return {
        // data: users,
        totalCount, // total number of vendor users
        // lastUpdated: lastUpdated._max.updated_at,
      };
    } catch (err) {
      throw new BadRequestException(`Could not fetch users: ${err.message}`);
    }
  }
  async getOrder() {
    try {
      // Get all orders with their order items and products
      const orders = await this.prisma.order.findMany({
        include: {
          order_items: {
            include: {
              product: true // Include product details if needed
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Get total count of orders
      const totalOrders = await this.prisma.order.count();

      // Calculate total number of products ordered (sum of all quantities)
      const totalProductsOrdered = await this.prisma.orderItem.aggregate({
        _sum: {
          quantity: true
        }
      });

      return {
        // orders,
        totalOrders,
        // totalProductsOrdered: totalProductsOrdered._sum.quantity || 0
      };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}