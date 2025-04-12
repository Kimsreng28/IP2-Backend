import { Module } from '@nestjs/common';
import { ProfileController } from './controller';
import { ProfileService } from './service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
