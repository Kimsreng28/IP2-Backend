import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShopController } from './controller';
import { ShopService } from './service';

@Module({
  imports: [HttpModule],
  controllers: [ShopController],
  providers: [ShopService, PrismaService],
})
export class ShopModule { }
