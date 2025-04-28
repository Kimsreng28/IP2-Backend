// ===========================================================================>> Core Library
import { Get, Controller } from '@nestjs/common';

// ===========================================================================>> service
import { ProductAdminService } from './service';

// ===========================================================================>> Costom Library


@Controller()
export class ProductAdminController {

    constructor(private readonly _service: ProductAdminService) { }
    @Get()
    async getDataProduct(){
        return await this._service.getDataProduct()
    }
}
