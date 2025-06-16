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
  UseGuards,
} from '@nestjs/common';
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
  constructor(private readonly _service: ShopService) {}

  @Get('setup')
  async getSetup() {
    return this._service.getSetup();
  }

  @UseGuards(JwtAuthGuard)
  @Get('products')
  async getFilteredProducts(@Query() query) {
    const userId = 1;
    return this._service.getFilteredProducts(query, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('product/:product_id')
  async viewProduct(
    @Param('product_id', ParseIntPipe) productId: number, // Changed 'id' to 'product_id'
    @UserDecorator() user?: { userId?: number },
  ) {
    try {
      const product = await this._service.viewProduct(productId, user?.userId);
      return {
        status: HttpStatus.OK,
        data: product,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('product/:product_id/relative')
  async viewRelativeProduct(
    @Param('product_id', ParseIntPipe) productId: number, // Changed 'id' to 'product_id'
    @UserDecorator() user?: { userId?: number },
  ) {
    return this._service.viewRelativeProduct(productId, user?.userId);
  }

  //======================================================= Get Review
  @Get('product/:product_id/review')
  async getAllQuestionProduct(@Param('product_id') productId: number) {
    const userId = 1;
    return await this._service.getAllReviews(productId);
  }

  @Post('product/:product_id/review')
  async createReview(
    @Param('product_id') productId: number,
    @Body() body: { rating: number; comment?: string },
    @Req() req: Request,
  ) {
    const userId = req['user']?.id ?? 1; // or anonymous
    return await this._service.createProductReview({
      product_id: productId,
      rating: body.rating,
      comment: body.comment,
      user_id: userId,
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
  async viewAllReviewProduct(@Param('product_id') productId: number) {
    const userId = 1;
    return await this._service.getAllQuestions(productId);
  }

  @Post('product/:product_id/question')
  async createQuestion(
    @Param('product_id') productId: number,
    @Body() body: { question: string },
    @Req() req: Request,
  ) {
    const userId = req['user']?.id ?? 1; // or anonymous
    return await this._service.createProductQuestion({
      product_id: productId,
      question: body.question,
      user_id: userId,
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

  @Post('product/:product_id/question/:questionId/comments')
  async addComment(
    @Param('product_id', ParseIntPipe) productId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: CreateQuestionCommentDto,
    @Req() req: Request,
  ) {
    const userId = req['user']?.id ?? 1; // or anonymous
    return this._service.addComment(userId, questionId, dto);
  }

  // ======================= Wishlist =======================
  @UseGuards(JwtAuthGuard)
  @Get('wishlist')
  async getWishlist(@Req() req): Promise<WishlistResponseDto[]> {
    return this._service.getWishlist(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('wishlist/:productId')
  async addToWishlist(
    @Req() req,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    try {
      return await this._service.toggleWishlist(req.user.id, productId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('wishlist/:productId')
  async removeFromWishlist(@Req() req, @Param('productId') productId: string) {
    return this._service.toggleWishlist(req.user.id, +productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wishlist/count')
  async getWishlistCount(@Req() req) {
    return this._service.getWishlistCount(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wishlist/check/:productId')
  async checkWishlist(@Req() req, @Param('productId') productId: string) {
    return this._service.isProductInWishlist(req.user.id, +productId);
  }

  // ======================= Cart =======================
  @UseGuards(JwtAuthGuard)
  @Get('cart')
  async getCart(@Req() req): Promise<CartItemResponseDto[]> {
    return this._service.getCart(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart')
  async addToCart(@Req() req, @Body() dto: AddToCartDto) {
    try {
      return await this._service.addToCart(
        req.user.id,
        dto.productId,
        dto.quantity || 1,
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('cart/:id')
  async updateCartItem(
    @Req() req,
    @Param('id') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this._service.updateCartItem(req.user.id, +cartItemId, dto.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cart/:id')
  async removeFromCart(@Req() req, @Param('id') cartItemId: string) {
    return this._service.removeFromCart(req.user.id, +cartItemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cart/count')
  async getCartCount(@Req() req) {
    return this._service.getCartCount(req.user.id);
  }
}
