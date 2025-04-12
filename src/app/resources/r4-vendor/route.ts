// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './a1-dashbord/module';

// ===========================================================================>> Custom Library

export const vendorRoutes: Routes = [
  {
    path: 'dashboard',
    module: DashboardModule,
  },
];
