import { Module } from '@nestjs/common';
import { DashboardController } from './controller';
import { DashboardService } from './service';
import { PrismaService } from 'src/prisma/prisma.service'; // Import your

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
})
export class DashboardModule {}
