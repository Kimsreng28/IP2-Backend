import { Module } from '@nestjs/common';
import { ProductController } from './controller';
import { ProductService } from './service';

@Module({
    controllers: [ProductController],
    providers: [ProductService]
})
export class ProductModule {}
