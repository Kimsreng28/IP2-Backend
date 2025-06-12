// ===========================================================================>> Custom Library
import { Controller, Get } from '@nestjs/common';

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
  async getNewArrivalProducts() {
    return await this._service.getNewArrivalProducts()
  }

  @Get('best-seller')
  async getProductBestSeller() {
    return await this._service.getProductBestSellers()
  }
  
}
