// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './a1-dashbord/module';

// ===========================================================================>> Custom Library

export const adminRoutes: Routes = [
    {
        path: 'dashboard',
        module: DashboardModule
    },
];