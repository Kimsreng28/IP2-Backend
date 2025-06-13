// ===========================================================================>> Custom Library
import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ShopService } from './service';

// ===========================================================================>> Custom Library

@Controller()
export class ShopController {
  constructor(private readonly _service: ShopService) { }

  @Get('setup')
  async getSetup() {
    return this._service.getSetup();
  }

  @Get('products')
  async getFilteredProducts(@Query() query) {
    return this._service.getFilteredProducts(query);
  }

  @Get('product/:product_id')
  async viewProduct(@Param('product_id') productId: number) {
    return await this._service.viewProduct(productId)
  }

  @Get('product/:product_id/relative')
  async viewRelativeProduct(@Param('product_id') productId: number) {
    const userId = 1;
    return await this._service.viewRelativeProduct(productId, userId)
  }

  //======================================================= Get Review
  @Get('product/:product_id/review')
  async getAllQuestionProduct(@Param('product_id') productId: number) {
    const userId = 1;
    return await this._service.getAllReviews(productId)
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

  
  @Get('product/:product_id/question')
  async viewAllReviewProduct(@Param('product_id') productId: number) {
    const userId = 1;
    return await this._service.getAllQuestions(productId)
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
}
