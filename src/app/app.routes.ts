// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { AuthModule } from './resources/r1-auth/auth.module';
import { clientRoutes } from './resources/r2-client/route';
import { adminRoutes } from './resources/r3-admin/route';
import { vendorRoutes } from './resources/r4-vendor/route';
import { ProfileModule } from './resources/r5-profile/module';

// ===========================================================================>> Custom Library
export const appRoutes: Routes = [
  {
    path: 'api',
    children: [
      {
        path: 'account',
        module: AuthModule,
      },
      {
        path: 'client',
        children: clientRoutes
      },
      {
        path: 'admin',
        children: adminRoutes
      },
      {
        path: 'vendor',
        children: vendorRoutes
      },
      {
        path: 'profile',
        module: ProfileModule,
      }
    ],
  },
];
