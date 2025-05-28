import { Module } from '@nestjs/common';
import { ProductController } from './controller';
import { ProductService } from './service';
import { FileService } from 'src/app/services/file.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [ProductController],
    providers: [ProductService, FileService]
})
export class ProductModule {}