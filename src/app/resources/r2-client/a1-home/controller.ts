// ===========================================================================>> Custom Library
import { Controller, Get, HttpException, HttpStatus, Param, Patch, Query, Req } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { HomeService } from './service';

@Controller()
export class HomeController {
  constructor(private readonly _service: HomeService) { }

  @Get('banner')
  getHello(): string {
    return 'Hello Home!';
  }

  @Get('new-arrival')
  async getNewArrivalProducts(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const userId = 1;
    return await this._service.getNewArrivalProducts(pageNum, limitNum, userId)
  }

  @Get('best-seller')
  async getProductBestSeller() {
    const userId = 1;
    return await this._service.getProductBestSellers(userId)
  }

  @Patch('favorites/:product_id')
  async addFavorite(@Req() request: Request, @Param('product_id') productId: number) {
    const userId = 1;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return await this._service.addFavorite(userId, productId);
  }

}
