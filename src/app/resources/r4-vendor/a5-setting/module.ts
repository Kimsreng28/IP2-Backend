import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FileService } from 'src/app/services/file.service';
import { SettingController } from './controller';
import { SettingService } from './service';

@Module({
  imports: [HttpModule],
  controllers: [SettingController],
  providers: [SettingService, FileService],
})
export class SettingModule {}
