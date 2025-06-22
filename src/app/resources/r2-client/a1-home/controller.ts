// ===========================================================================>> Custom Library
import { Controller, Get, Param, Patch, Query, Req } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { HomeService } from './service';

@Controller()
export class HomeController {
  constructor(private readonly _service: HomeService) { }

  @Get('banner')
  getHello(): string {
    return 'Hello Home!';
  }

  @Get('new-arrival/:userId?') // `userId` is optional
  async getNewArrivalProducts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Param('userId') userIdParam?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const userId = Number(userIdParam);
    const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;

    return await this._service.getNewArrivalProducts(pageNum, limitNum, finalUserId);
  }

  @Get('best-seller/:userId?')
  async getProductBestSeller(
    @Param('userId') userIdParam?: string,
  ) {
    // Convert to number and fallback to 1
    const userId = Number(userIdParam);
    const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;
    console.log(finalUserId)
    return await this._service.getProductBestSellers(finalUserId);
  }

  @Patch('wishlists/:product_id/:userId?')
  async addWishlist(@Req() request: Request, @Param('product_id') productId: number,  @Param('userId') userIdParam?: string,) {
   const userId = Number(userIdParam);
    const finalUserId = !isNaN(userId) && userId > 0 ? userId : 1;
    return await this._service.addWishlist(finalUserId, productId);
  }

}
