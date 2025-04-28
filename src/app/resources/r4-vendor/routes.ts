// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';

// ===========================================================================>> Custom Library
import { ProductVendorModule } from './a1-product-vendor/module';


export const vendorRoute: Routes = [{
    path: 'api',
    children: [
        {
            path: 'product',
            module: ProductVendorModule
        },
       
    ]
}];