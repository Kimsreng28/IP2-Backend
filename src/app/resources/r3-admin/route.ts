// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './a1-dashbord/module';
import { PermissionAdminModule } from './a2-permission-manage-user/module';
import { SettingAdminModule } from './a5-setting/module';
import { UserAdminModule } from './a3-user/module';

// ===========================================================================>> Custom Library

export const adminRoutes: Routes = [
    {
      path: 'dashboard',
      module: DashboardModule,
    },
    {
      path: 'permission',
      module: PermissionAdminModule,
    },
    {
      path: 'user',
      module: UserAdminModule,
    },
    {
      path: 'setting',
      module: SettingAdminModule,
    },
];
