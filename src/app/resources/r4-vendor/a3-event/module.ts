import { Module } from '@nestjs/common';
import { FileService } from 'src/app/services/file.service';
import { HttpModule } from '@nestjs/axios';
import { VendorEventController } from './controller';
import { VendorEventService } from './service';

@Module({
    imports: [HttpModule],
    controllers: [VendorEventController],
    providers: [VendorEventService, FileService]
})
export class VendorEventModule {}