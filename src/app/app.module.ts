import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { ConfigModule } from 'src/config/config.module';
import { AppController } from './app.controller';
import { appRoutes } from './app.routes';
import { ExceptionErrorsFilter } from './core/exceptions/errors.filter';
import { TimeoutInterceptor } from './core/interceptors/timeout.interceptor';
import { JwtMiddleware } from './core/middlewares/jwt.middleware';
import { AuthModule } from './resources/r1-auth/module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,

    //===================== END OF ROLE USER
    RouterModule.register(appRoutes)
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionErrorsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(JwtMiddleware)
          .exclude(
              { path: '', method: RequestMethod.GET },
              { path: 'api/account/(.*)', method: RequestMethod.POST },
              { path: 'api/testing/(.*)', method: RequestMethod.ALL }, 
          ).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}