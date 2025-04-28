// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// ============================================================================>> Custom Library
import { ProductVendorModule } from './a1-product-vendor/module';

// ======================================= >> Code Starts Here << ========================== //
@Module({
    imports: [
        ProductVendorModule,
    ]
})
// why losing file
export class VendorModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        throw new Error('Method not implemented.');
    }
}