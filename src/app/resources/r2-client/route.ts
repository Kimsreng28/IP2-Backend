// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
// ===========================================================================>> Custom Library
import { HomeModule } from './a1-home/module';
import { ShopModule } from './a2-shop/module';


export const clientRoutes: Routes = [
  {
    path: 'home',
    module: HomeModule,
  },
  {
    path: 'shop',
    module: ShopModule,
  },
];
