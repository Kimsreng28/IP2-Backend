// ===========================================================================>> Core Library
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ClientMiddleware } from 'src/app/core/middlewares/client.middleware';
import { DeviceTrackerMiddleware } from 'src/app/core/middlewares/device_tracker.middleware';
import { HomeModule } from './a1-home/module';

// ===========================================================================>> Custom Library

@Module({
  imports: [HomeModule],
})
export class ClientModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClientMiddleware, DeviceTrackerMiddleware)
      .forRoutes({ path: 'api/client/*', method: RequestMethod.ALL });
  }
}
