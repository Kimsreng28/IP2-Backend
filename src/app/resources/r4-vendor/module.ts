// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ClientMiddleware } from 'src/app/core/middlewares/client.middleware';
import { DeviceTrackerMiddleware } from 'src/app/core/middlewares/device_tracker.middleware';
import { DashboardModule } from './a1-dashbord/module';

// ===========================================================================>> Custom Library

@Module({
    imports: [
        DashboardModule
    ]
})

export class VendorModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(ClientMiddleware, DeviceTrackerMiddleware)
            .forRoutes({ path: 'api/vendor/*', method: RequestMethod.ALL });
    }
}