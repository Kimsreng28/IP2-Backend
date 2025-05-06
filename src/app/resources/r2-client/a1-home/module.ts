import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FileService } from 'src/app/services/file.service';
import { HomeController } from './controller';
import { HomeService } from './service';

@Module({
  imports: [HttpModule],
  controllers: [HomeController],
  providers: [HomeService, FileService],
})
export class HomeModule {}
