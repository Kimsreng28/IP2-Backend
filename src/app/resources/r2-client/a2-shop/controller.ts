// ===========================================================================>> Custom Library
import { Controller, Get, Query } from '@nestjs/common';
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

}
