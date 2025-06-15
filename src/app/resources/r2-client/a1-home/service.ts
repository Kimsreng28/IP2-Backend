// ===========================================================================>> Core Library
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// ===========================================================================>> Third Party Library
import { PrismaService } from 'src/prisma/prisma.service';

// ===========================================================================>> Custom Library
@Injectable()
export class HomeService {

    constructor(private prisma: PrismaService) { }
    async getNewArrivalProducts(page: number = 1, limit: number = 10, userId?: number) {
        try {
            // Ensure page and limit are positive integers
            const pageNum = Math.max(1, page);
            const limitNum = Math.max(1, Math.min(limit, 100));
            const skip = (pageNum - 1) * limitNum;

            // Fetch products
            const products = await this.prisma.product.findMany({
                where: {
                    is_new_arrival: true,
                },
                include: {
                    category: true,
                    brand: true,
                    product_images: true,
                    discounts: true,
                },
                skip,
                take: limitNum,
            });

            // Fetch total count
            const total = await this.prisma.product.count({
                where: {
                    is_new_arrival: true,
                },
            });

            // If userId is provided, check which products are favorited
            let productsWithFavorites = products;
            if (userId) {
                // Fetch favorite entries for this user and these products
                const productIds = products.map((product) => product.id);
                const favoriteEntries = await this.prisma.wishlist.findMany({
                    where: {
                        user_id: userId,
                        product_id: { in: productIds },
                    },
                    select: { product_id: true },
                });
                const favoritedProductIds = new Set(favoriteEntries.map((entry) => entry.product_id));

                // Add isFavorite flag to each product
                productsWithFavorites = products.map((product) => ({
                    ...product,
                    is_favorite: favoritedProductIds.has(product.id) ?? false,
                }));
            }

            return {
                status: HttpStatus.OK,
                data: productsWithFavorites,
                pagination: {
                    currentPage: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            };
        } catch (error) {
            throw new Error('Could not fetch new arrival products');
        }
    }

    async getProductBestSellers(userId?: number) {
        try {
            const limit = 8;

            const products = await this.prisma.product.findMany({
                include: {
                    category: true,
                    brand: true,
                    product_images: true,
                    discounts: true,
                },
                take: limit,
            });

            let productsWithFavorites = products;

            if (userId) {
                const productIds = products.map((product) => product.id);

                const favoriteEntries = await this.prisma.wishlist.findMany({
                    where: {
                        user_id: userId,
                        product_id: { in: productIds },
                    },
                    select: { product_id: true },
                });

                const favoritedProductIds = new Set(
                    favoriteEntries.map((entry) => entry.product_id)
                );

                productsWithFavorites = products.map((product) => ({
                    ...product,
                    is_favorite: favoritedProductIds.has(product.id),
                }));
            }

            return {
                status: HttpStatus.OK,
                data: productsWithFavorites,
            };
        } catch (error) {
            console.error('Error fetching best seller products:', error);
            throw new Error('Could not fetch best seller products');
        }
    }


    async addWishlist(userId: number, productId: number) {
        try {
            // Validate product exists
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
            });

            if (!product) {
                throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
            }

            // Check if wishlist exists
            const existingWishlist = await this.prisma.wishlist.findFirst({
                where: {
                    user_id: userId,
                    product_id: productId,
                },
            });

            if (existingWishlist) {
                // Remove wishlist
                await this.prisma.wishlist.delete({
                    where: {
                        id: existingWishlist.id,
                    },
                });
                return {
                    status: HttpStatus.OK,
                    action: 'removed',
                    message: 'Product removed from wishlists',
                };
            } else {
                // Add wishlist
                const wishlist = await this.prisma.wishlist.create({
                    data: {
                        user_id: userId,
                        product_id: productId,
                        created_at: new Date(),
                    },
                });
                return {
                    status: HttpStatus.OK,
                    action: 'added',
                    data: {
                        id: wishlist.id,
                        userId: wishlist.user_id,
                        productId: wishlist.product_id,
                        createdAt: wishlist.created_at,
                    },
                };
            }
        } catch (error) {
            console.error('Error in addWishlist:', error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new HttpException('Product already wishlisted', HttpStatus.CONFLICT);
            }
            throw new HttpException('Could not toggle wishlist', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
