// ===========================================================================>> Custom Library
import { Controller, Get, Param, Query } from '@nestjs/common';
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
  async viewProduct(@Param('product_id') productId: number){
    
  }

}
