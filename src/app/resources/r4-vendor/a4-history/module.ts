import { Module } from '@nestjs/common';
import { OrderHistoryController } from './controller';
import { OrderHistoryService } from './service';

@Module({
  controllers: [OrderHistoryController],
  providers: [OrderHistoryService],
})
export class OrderHistoryModule {}
