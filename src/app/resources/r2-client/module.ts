// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// ============================================================================>> Custom Library
import { ProductClientModule } from './a1-product-client/module';
// ======================================= >> Code Starts Here << ========================== //
@Module({
    imports: [
        ProductClientModule,
    ]
})
// why losing file
export class ClientModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        throw new Error('Method not implemented.');
    }
}