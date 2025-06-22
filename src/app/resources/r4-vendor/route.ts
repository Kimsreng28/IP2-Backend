// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './a1-dashbord/module';
import { ProductModule } from './a2-product/module';
import { VendorEventModule } from './a3-event/module';
import { OrderHistoryModule } from './a4-history/module';
import { SettingModule } from './a5-setting/module';

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
  {
    path: 'event',
    module: VendorEventModule,
  },
  {
    path: 'orderhistory',
    module: OrderHistoryModule,
  },
  {
    path: 'setting',
    module: SettingModule,
  },
];
