// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';

// ===========================================================================>> Custom Library
import { ProductClientModule } from './a1-product-client/module';


export const clientRoute: Routes = [{
    path: 'api',
    children: [
        {
            path: 'product',
            module: ProductClientModule
        },
       
    ]
}];