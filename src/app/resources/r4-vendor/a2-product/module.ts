import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FileService } from 'src/app/services/file.service';
import { ProductController } from './controller';
import { ProductService } from './service';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [ProductService, FileService],
})
export class ProductModule {}
