import { Module } from '@nestjs/common';
import { FileService } from 'src/app/services/file.service';
import { HomeController } from './controller';
import { HomeService } from './service';

@Module({
  controllers: [HomeController],
  providers: [HomeService, FileService],
})
export class HomeModule {}
