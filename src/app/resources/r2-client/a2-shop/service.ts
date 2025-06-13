import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopService {
    constructor(private prisma: PrismaService) { }

    async getSetup() {
        const category = await this.prisma.category.findMany()
        return {
            status: HttpStatus.OK,
            data: category
        }
    }

    async getFilteredProducts(query: {
        category?: number;
        priceRanges?: string;
        sortBy?: string;
        search?: string;
        page?: number | string;
        limit?: number | string;
    }) {
        try {
            // Parse pagination values safely
            const page = Number(query.page) || 1;
            const limit = Number(query.limit) || 20;
            const skip = (page - 1) * limit;
            const take = limit;

            const { category, priceRanges, sortBy = 'newest', search } = query;
            const categoryId = category ? Number(category) : undefined;

            // Parse price ranges (e.g., "500-800,1000-1500")
            const priceFilter = priceRanges?.split(',').map((range) => {
                const [min, max] = range.split('-').map(Number);
                return {
                    price: {
                        gte: isNaN(min) ? 0 : min,
                        lte: isNaN(max) ? Number.MAX_SAFE_INTEGER : max,
                    },
                };
            });

            const where: Prisma.ProductWhereInput = {
                ...(categoryId && { category_id: categoryId }),
                ...(search && {
                    name: {
                        contains: search,
                        // mode: 'insensitive',
                    },
                }),
                ...(priceFilter?.length && { OR: priceFilter }),
            };

            const orderBy: Prisma.ProductOrderByWithRelationInput =
                sortBy === 'price_asc'
                    ? { price: 'asc' }
                    : sortBy === 'price_desc'
                        ? { price: 'desc' }
                        : { created_at: 'desc' };

            const products = await this.prisma.product.findMany({
                where,
                orderBy,
                skip,
                take,
                include: {
                    category: true,
                    brand: true,
                    product_images: true,
                    discounts: true,
                },
            });

            const total = await this.prisma.product.count({ where });

            if (products.length === 0) {
                return {
                    status: HttpStatus.OK,
                    message: 'No products found',
                    data: [],
                    total: 0,
                    currentPage: page,
                    totalPages: 0,
                };
            }

            return {
                status: HttpStatus.OK,
                data: products,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error(error);
            throw new Error('Could not fetch filtered products');
        }
    }
}
