// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { AuthModule } from './resources/r1-auth/module';

// ===========================================================================>> Custom Library
export const appRoutes: Routes = [{
    path: 'api',
    children: [
        {
            path: 'account',
            module:  AuthModule
        },
        {
            path: 'client',
            // children: adminRoutes
        },
        {
            path: 'admin',
            // children: adminRoutes
        },
        {
            path: 'vendor',
            // children: adminRoutes
        },
       
    ]
}];