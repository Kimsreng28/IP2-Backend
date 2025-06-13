import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

    async viewProduct(productId: number) {
        try {
            // Validate product exists
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
                include: {
                    category: true,
                    brand: true,
                    product_images: true,
                    discounts: true,
                },
            });
            if (!product) {
                throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
            }

            return product
        } catch (error) {

        }
    }
    async viewRelativeProduct(productId: number, userId?: number) {
        try {
            // Step 1: Find the current product and its category
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
                include: {
                    category: true,
                    brand: true,
                    product_images: true,
                    discounts: true,
                },
            });

            if (!product) {
                throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
            }

            // Step 2: Find other products in the same category (excluding this one)
            const relatedProducts = await this.prisma.product.findMany({
                where: {
                    category_id: product.category_id,
                    NOT: {
                        id: productId,
                    },
                },
                include: {
                    category: true,
                    brand: true,
                    product_images: true,
                    discounts: true,
                },
                take: 10, // or any limit you prefer
            });

            let productsWithFavorites = relatedProducts;

            if (userId) {
                const productIds = relatedProducts.map((product) => product.id);

                const favoriteEntries = await this.prisma.favorite.findMany({
                    where: {
                        user_id: userId,
                        product_id: { in: productIds },
                    },
                    select: { product_id: true },
                });

                const favoritedProductIds = new Set(
                    favoriteEntries.map((entry) => entry.product_id)
                );

                productsWithFavorites = relatedProducts.map((product) => ({
                    ...product,
                    is_favorite: favoritedProductIds.has(product.id),
                }));
            }

            return {
                status: HttpStatus.OK,
                data: productsWithFavorites,
            };
        } catch (error) {
            console.error("Error in viewRelativeProduct:", error);
            throw new HttpException('Failed to fetch related products', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllReviews(productId: number) {
        return this.prisma.productReview.findMany({
            where: { product_id: productId },
            include: {
                user: true,  // user can be null
            },
            orderBy: { created_at: 'desc' },
        });
    }

    // Create product review
    async createProductReview(data: {
        product_id: number;
        rating: number;
        comment?: string;
        user_id?: number | null; // optional for anonymous
    }) {
        const product = await this.prisma.product.findUnique({ where: { id: data.product_id } });
        if (!product) throw new BadRequestException('Product not found');

        return this.prisma.productReview.create({
            data: {
                product_id: data.product_id,
                user_id: data.user_id ?? null,
                rating: data.rating,
                comment: data.comment ?? null,
            },
        });
    }

    async toggleLike(reviewId: number, like: boolean = true) {
        const review = await this.prisma.productReview.findUnique({
            where: { id: reviewId },
            select: { likes: true }, // explicitly fetch likes
        });
        if (!review) throw new Error("Review not found");

        const updatedLikes = like ? review.likes + 1 : Math.max(review.likes + 1, 0);

        return this.prisma.productReview.update({
            where: { id: reviewId },
            data: { likes: updatedLikes },
        });
    }

    async toggleDislike(reviewId: number, dislike: boolean = true) {
        const review = await this.prisma.productReview.findUnique({
            where: { id: reviewId },
            select: { dislikes: true }, // explicitly fetch dislikes
        });
        if (!review) throw new Error("Review not found");

        const updatedDislikes = dislike ? review.dislikes + 1 : Math.max(review.dislikes - 1, 0);

        return this.prisma.productReview.update({
            where: { id: reviewId },
            data: { dislikes: updatedDislikes },
        });
    }

    
    async getAllQuestions(productId: number) {
        return this.prisma.productQuestion.findMany({
            where: { product_id: productId },
            include: {
                user: true,  // user can be null
                comments: true,  // user can be null
            },
            orderBy: { created_at: 'desc' },
        });
    }

    // Create product question
    async createProductQuestion(data: {
        product_id: number;
        question: string;
        user_id?: number | null; // optional for anonymous
    }) {
        const product = await this.prisma.product.findUnique({ where: { id: data.product_id } });
        if (!product) throw new BadRequestException('Product not found');

        return this.prisma.productQuestion.create({
            data: {
                product_id: data.product_id,
                user_id: data.user_id ?? null,
                question: data.question,
            },
        });
    }


}