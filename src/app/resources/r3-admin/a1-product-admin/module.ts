// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ============================================================================>> Custom Library
import { ProductAdminController } from './controller';
import { ProductAdminService } from './service';
// ======================================= >> Code Starts Here << ========================== //
@Module({
    controllers   : [ProductAdminController],
    providers     : [ProductAdminService],
})
export class ProductAdminModule { }