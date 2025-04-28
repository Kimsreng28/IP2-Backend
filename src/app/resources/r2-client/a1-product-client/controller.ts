// ===========================================================================>> Core Library
import { Get, Controller } from '@nestjs/common';

// ===========================================================================>> service
import { ProductClientService } from './service';

// ===========================================================================>> Costom Library


@Controller()
export class ProductClientController {

    constructor(private readonly _service: ProductClientService) { }
    @Get()
    async getDataProduct(){
        return await this._service.getDataProduct()
    }
}
