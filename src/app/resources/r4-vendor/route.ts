// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './a1-dashbord/module';
import { ProductModule } from './a2-product/module';

// ===========================================================================>> Custom Library

export const vendorRoutes: Routes = [
  {
    path: 'dashboard',
    module: DashboardModule,
  },
  {
    path: 'product',
    module: ProductModule,
  },
];
