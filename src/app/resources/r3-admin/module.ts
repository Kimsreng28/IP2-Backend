// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DeviceTrackerMiddleware } from 'src/app/core/middlewares/device_tracker.middleware';
import { DashboardModule } from './a1-dashbord/module';
import { PermissionAdminModule } from './a2-permission-manage-user/module';
import { SettingAdminModule } from './a5-setting/module';
import { UserAdminModule } from './a3-user/module';

// ===========================================================================>> Custom Library

@Module({
    imports: [
        DashboardModule,
        PermissionAdminModule,
        SettingAdminModule,
        UserAdminModule
    ]
})

export class AdminModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(DeviceTrackerMiddleware)
            .forRoutes({ path: 'api/admin/*', method: RequestMethod.ALL });
    }
}