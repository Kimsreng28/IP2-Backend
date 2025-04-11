// ===========================================================================>> Core Library
import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

// ===========================================================================>> Third Party Library
import * as multer from 'multer';

// ===========================================================================>> Custom Library
import { PrismaService } from 'src/prisma/prisma.service';

/** @noted We use Global that allows all modules to access and use all services */
@Global()
@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    PrismaService, // Register PrismaService globally
  ],
  exports: [PrismaService, HttpModule],
})
export class ConfigModule {}
