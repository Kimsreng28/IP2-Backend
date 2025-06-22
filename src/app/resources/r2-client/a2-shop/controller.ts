// ===========================================================================>> Custom Library
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { RolesDecorator } from 'src/app/core/decorators/roles.decorator';
import UserDecorator from 'src/app/core/decorators/user.decorator';
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
import { ShopService } from './service';
import {
  AddToCartDto,
  CartItemResponseDto,
  CreateQuestionCommentDto,
  LikeQuestionDto,
  UpdateCartItemDto,
  WishlistResponseDto,
} from './shop.dto';

// ===========================================================================>> Custom Library

@Controller()
export class ShopController {
  constructor(private readonly _service: ShopService) { }

  @Get('setup')
  async getSetup() {
    return this._service.getSetup();
  }

  // @UseGuards(JwtAuthGuard)
  @Get('/:userId?/products')
  async getFilteredProducts(
    @Query() query: Record<string, any>,
    @Param('userId') userIdParam?: string,
  ) {
    const userId = Number(userIdParam);
    const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;

    return this._service.getFilteredProducts(query, finalUserId);
  }

  @Get('product/:product_id/:userId?')
  async viewProduct(
    @Param('product_id', ParseIntPipe) productId: number,
    @Param('userId') userIdParam?: string,
  ) {
    try {

      const userId = Number(userIdParam);
      const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;
      const product = await this._service.viewProduct(productId, finalUserId);
      return {
        status: HttpStatus.OK,
        data: product,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('product/:product_id/relative/:userId?')
  async viewRelativeProduct(
    @Param('product_id', ParseIntPipe) productId: number, // Changed 'id' to 'product_id'
    @Param('userId') userIdParam?: string,
  ) {
    // Convert to number and fallback to 1
    const userId = Number(userIdParam);
    const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;
    return this._service.viewRelativeProduct(productId, finalUserId);
  }

  //======================================================= Get Review
  @Get('product/:product_id/review')
  async getAllQuestionProduct(@Param('product_id') productId: number) {
    const userId = 1;
    return await this._service.getAllReviews(productId);
  }

  @Post('product/:product_id/review/:userId?')
  async createReview(
    @Param('product_id') productId: number,
    @Body() body: { rating: number; comment?: string },
    @Req() req: Request,
    @Param('userId') userIdParam?: string,
  ) {
    // Convert to number and fallback to 1
    const userId = Number(userIdParam);
    const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;
    return await this._service.createProductReview({
      product_id: productId,
      rating: body.rating,
      comment: body.comment,
      user_id: finalUserId,
    });
  }

  @Post('product/:product_id/review/:review_id/like')
  async likeReview(
    @Param('review_id') reviewId: number,
    @Body() body: { like: boolean },
  ) {
    return this._service.toggleLike(reviewId, body.like);
  }

  @Post('product/:product_id/review/:review_id/dislike')
  async dislikeReview(
    @Param('review_id') reviewId: number,
    @Body() body: { dislike: boolean },
  ) {
    return this._service.toggleDislike(reviewId, body.dislike);
  }

  // =========================================================================== Question
  @Get('product/:product_id/question')
  async viewAllReviewProduct(
    @Param('product_id') productId: number,
    @Param('userId') userIdParam?: string,
  ) {
    return await this._service.getAllQuestions(productId);
  }

  @Post('product/:product_id/question/:userId?')
  async createQuestion(
    @Param('product_id') productId: number,
    @Body() body: { question: string },
    @Req() req: Request,
    @Param('userId') userIdParam?: string,
  ) {
    // Convert to number and fallback to 1
    const userId = Number(userIdParam);
    const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;
    return await this._service.createProductQuestion({
      product_id: productId,
      question: body.question,
      user_id: finalUserId,
    });
  }

  @Post('product/:product_id/question/:questionId/like')
  async likeQuestion(
    @Param('product_id', ParseIntPipe) productId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: LikeQuestionDto,
  ) {
    return this._service.likeQuestion(productId, questionId, dto);
  }

  @Post('product/:product_id/question/:questionId/comments/:userId?')
  async addComment(
    @Param('product_id', ParseIntPipe) productId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: CreateQuestionCommentDto,
    @Req() req: Request,
    @Param('userId') userIdParam?: string,
  ) {
    // Convert to number and fallback to 1
    const userId = Number(userIdParam);
    const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;
    return this._service.addComment(finalUserId, questionId, dto);
  }

  // ======================= Wishlist =======================
  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Get('wishlist')
  async getWishlist(@Req() req): Promise<WishlistResponseDto[]> {
    return this._service.getWishlist(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Post('wishlist/:productId')
  async toggleWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @UserDecorator() user: { userId: number },
  ) {
    return this._service.toggleWishlist(user.userId, productId);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Delete('wishlist/:productId')
  async removeFromWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @UserDecorator() user: { userId: number },
  ) {
    return this._service.removeFromWishlist(user.userId, productId);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Get('wishlist/count')
  async getWishlistCount(@Req() req) {
    return this._service.getWishlistCount(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Get('wishlist/check/:productId')
  async checkWishlist(@Req() req, @Param('productId') productId: string) {
    return this._service.isProductInWishlist(req.user.id, +productId);
  }

  // ======================= Cart =======================
  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Get('cart')
  async getCart(@Req() req): Promise<CartItemResponseDto[]> {
    return this._service.getCart(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Post('cart')
  async addToCart(
    @Body() dto: AddToCartDto,
    @UserDecorator() user: { userId: number }, // Properly typed user decorator
  ) {
    try {
      console.log('Adding to cart for user:', user.userId); // Debug log
      const result = await this._service.addToCart(
        user.userId,
        dto.productId,
        dto.quantity || 1,
      );
      return {
        statusCode: HttpStatus.OK,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      console.error('Cart Controller Error:', {
        error,
        userId: user?.userId,
        productId: dto.productId,
        timestamp: new Date().toISOString(),
      });

      throw new HttpException(
        error.message || 'Failed to add to cart',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Put('cart/:id')
  async updateCartItem(
    @Req() req,
    @Param('id') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this._service.updateCartItem(req.user.id, +cartItemId, dto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Delete('cart/:id')
  async removeFromCart(
    @Param('id', ParseIntPipe) cartItemId: number,
    @UserDecorator() user: { userId: number },
  ) {
    return this._service.removeFromCart(user.userId, cartItemId);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Delete('cart')
  async clearCart(@Req() req) {
    return this._service.clearCart(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.CUSTOMER)
  @Get('cart/count')
  async getCartCount(@Req() req) {
    return this._service.getCartCount(req.user.id);
  }
}
