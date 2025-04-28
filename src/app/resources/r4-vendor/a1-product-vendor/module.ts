// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ============================================================================>> Custom Library
import { ProductVendorController } from './controller';
import { ProductVendorService } from './service';
// ======================================= >> Code Starts Here << ========================== //
@Module({
    controllers   : [ProductVendorController],
    providers     : [ProductVendorService],
})
export class ProductVendorModule { }