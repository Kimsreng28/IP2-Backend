// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';

// ===========================================================================>> Custom Library
import { ProductAdminModule } from './a1-product-admin/module';


export const adminRoute: Routes = [{
    path: 'api',
    children: [
        {
            path: 'product',
            module: ProductAdminModule
        },
       
    ]
}];