// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// ============================================================================>> Custom Library
import { ProductAdminModule } from './a1-product-admin/module';
// ======================================= >> Code Starts Here << ========================== //
@Module({
    imports: [
        ProductAdminModule,
    ]
})
// why losing file
export class AdminModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        throw new Error('Method not implemented.');
    }
}