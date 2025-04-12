// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DeviceTrackerMiddleware } from 'src/app/core/middlewares/device_tracker.middleware';
import { HomeModule } from './a1-home/module';

// ===========================================================================>> Custom Library

@Module({
    imports: [
        HomeModule
    ]
})

export class ClientModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(DeviceTrackerMiddleware)
            .forRoutes({ path: 'api/client/*', method: RequestMethod.ALL });
    }
}