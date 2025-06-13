import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeController } from './controller';
import { HomeService } from './service';

@Module({
  imports: [HttpModule],
  controllers: [HomeController],
  providers: [HomeService, PrismaService],
})
export class HomeModule { }
