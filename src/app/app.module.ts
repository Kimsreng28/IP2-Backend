import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_FILTER, APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { AppController } from './app.controller';
import { appRoutes } from './app.routes';
import { ExceptionErrorsFilter } from './core/exceptions/errors.filter';
import { TimeoutInterceptor } from './core/interceptors/timeout.interceptor';
import { AuthModule } from './resources/r1-auth/auth.module';
import { ClientModule } from './resources/r2-client/module';
import { AdminModule } from './resources/r3-admin/module';
import { VendorModule } from './resources/r4-vendor/module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './resources/r5-profile/module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    PrismaModule,
    AuthModule,
    ClientModule,
    UserModule,
    AdminModule,
    VendorModule,
    ProfileModule,
    RouterModule.register(appRoutes),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionErrorsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
