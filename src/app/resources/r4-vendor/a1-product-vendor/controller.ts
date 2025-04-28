// ===========================================================================>> Core Library
import { Get, Controller } from '@nestjs/common';

// ===========================================================================>> service
import { ProductVendorService } from './service';

// ===========================================================================>> Costom Library


@Controller()
export class ProductVendorController {

    constructor(private readonly _service: ProductVendorService) { }
    @Get()
    async getDataProduct(){
        return await this._service.getDataProduct()
    }
}
