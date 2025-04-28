// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ============================================================================>> Custom Library
import { ProductClientController } from './controller';
import { ProductClientService } from './service';
// ======================================= >> Code Starts Here << ========================== //
@Module({
    controllers   : [ProductClientController],
    providers     : [ProductClientService],
})
export class ProductClientModule { }