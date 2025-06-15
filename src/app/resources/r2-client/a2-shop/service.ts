import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionCommentDto, LikeQuestionDto } from './shop.dto';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async getSetup() {
    const category = await this.prisma.category.findMany();
    return {
      status: HttpStatus.OK,
      data: category,
    };
  }

  async getFilteredProducts(
    query: {
      category?: number;
      priceRanges?: string;
      sortBy?: string;
      search?: string;
      page?: number | string;
      limit?: number | string;
    },
    userId: number,
  ) {
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
          favoriteEntries.map((entry) => entry.product_id),
        );

        productsWithFavorites = products.map((product) => ({
          ...product,
          is_favorite: favoritedProductIds.has(product.id),
        }));
      }

      return {
        status: HttpStatus.OK,
        data: productsWithFavorites,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(error);
      throw new Error('Could not fetch filtered products');
    }
  }

  async viewProduct(productId: number, userId?: number) {
    try {
      // 1. Get product with related info
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

      // 2. Check if user has this product in wishlist
      let is_favorite = false;
      if (userId) {
        const favorite = await this.prisma.wishlist.findFirst({
          where: {
            user_id: userId,
            product_id: productId,
          },
        });
        is_favorite = !!favorite;
      }

      // 3. Return enriched product
      return {
        ...product,
        is_favorite,
      };
    } catch (error) {
      console.error('Error in viewProduct:', error);
      throw new HttpException(
        'Could not load product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

        const favoriteEntries = await this.prisma.wishlist.findMany({
          where: {
            user_id: userId,
            product_id: { in: productIds },
          },
          select: { product_id: true },
        });

        const favoritedProductIds = new Set(
          favoriteEntries.map((entry) => entry.product_id),
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
      console.error('Error in viewRelativeProduct:', error);
      throw new HttpException(
        'Failed to fetch related products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllReviews(productId: number) {
    return this.prisma.productReview.findMany({
      where: { product_id: productId },
      include: {
        user: true, // user can be null
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
    const product = await this.prisma.product.findUnique({
      where: { id: data.product_id },
    });
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
    if (!review) throw new Error('Review not found');

    const updatedLikes = like
      ? review.likes + 1
      : Math.max(review.likes + 1, 0);

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
    if (!review) throw new Error('Review not found');

    const updatedDislikes = dislike
      ? review.dislikes + 1
      : Math.max(review.dislikes - 1, 0);

    return this.prisma.productReview.update({
      where: { id: reviewId },
      data: { dislikes: updatedDislikes },
    });
  }

  async getAllQuestions(productId: number) {
    return this.prisma.productQuestion.findMany({
      where: { product_id: productId },
      include: {
        user: true, // Include the user who asked the question
        comments: {
          include: {
            user: true, // Include the user who wrote the comment
          },
        },
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
    const product = await this.prisma.product.findUnique({
      where: { id: data.product_id },
    });
    if (!product) throw new BadRequestException('Product not found');

    return this.prisma.productQuestion.create({
      data: {
        product_id: data.product_id,
        user_id: data.user_id ?? null,
        question: data.question,
      },
    });
  }

  async likeQuestion(
    productId: number,
    questionId: number,
    dto: LikeQuestionDto,
  ) {
    const question = await this.prisma.productQuestion.findFirst({
      where: {
        id: questionId,
        product_id: productId,
      },
    });

    if (!question) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }

    const updated = await this.prisma.productQuestion.update({
      where: { id: questionId },
      data: {
        likes: {
          increment: dto.like ? 1 : -1,
        },
      },
    });

    return {
      message: dto.like ? 'Liked question' : 'Unliked question',
      data: {
        id: updated.id,
        likes: updated.likes,
      },
    };
  }

  async addComment(
    userId: number,
    questionId: number,
    dto: CreateQuestionCommentDto,
  ) {
    // Optional: Validate that the question exists
    const question = await this.prisma.productQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }

    const comment = await this.prisma.productQuestionComment.create({
      data: {
        question_id: questionId,
        user_id: userId,
        comment: dto.comment,
      },
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Comment added successfully',
      data: comment,
    };
  }

  async toggleWishlist(userId: number, productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const existingWishlistItem = await this.prisma.wishlist.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (existingWishlistItem) {
      // If it exists, remove it
      await this.prisma.wishlist.delete({
        where: { id: existingWishlistItem.id },
      });
      return {
        status: HttpStatus.OK,
        message: 'Product removed from wishlist',
      };
    } else {
      // If it doesn't exist, add it
      await this.prisma.wishlist.create({
        data: {
          user_id: userId,
          product_id: productId,
        },
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Product added to wishlist',
      };
    }
  }

  async addToCart(userId: number, productId: number, quantity: number = 1) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    // Check if the product is already in the cart
    const existingCartItem = await this.prisma.cart.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (existingCartItem) {
      // If it exists, update the quantity
      const updatedCartItem = await this.prisma.cart.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Product quantity updated in cart',
        data: updatedCartItem,
      };
    } else {
      // If it doesn't exist, add it to the cart
      const newCartItem = await this.prisma.cart.create({
        data: {
          user_id: userId,
          product_id: productId,
          quantity,
        },
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Product added to cart',
        data: newCartItem,
      };
    }
  }
}
