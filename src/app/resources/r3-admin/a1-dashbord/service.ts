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
    const sales = 24

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

      // Count total products
      const countPromise = this.prisma.product.count();

      // Await both promises concurrently
      const [products, totalCount] = await Promise.all([productsPromise, countPromise]);

      return {
        data: products,
        totalCount, // total number of products
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



}