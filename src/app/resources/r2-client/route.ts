// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { HomeModule } from './a1-home/module';

// ===========================================================================>> Custom Library

export const clientRoutes: Routes = [
    {
        path: 'home',
        module: HomeModule
    },
];