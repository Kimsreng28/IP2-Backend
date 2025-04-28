// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';

// ===========================================================================>> module
import { AuthModule } from './resources/r1-auth/module';

// ===========================================================================>> route
import { clientRoute } from './resources/r2-client/routes';
import { adminRoute } from './resources/r3-admin/routes';
import { vendorRoute } from './resources/r4-vendor/routes';

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
            children: clientRoute
        },
        {
            path: 'admin',
            children: adminRoute
        },
        {
            path: 'vendor',
            children: vendorRoute
        },
       
    ]
}];