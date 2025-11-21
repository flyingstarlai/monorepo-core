import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { UsersModule } from '../users/users.module';
import { MobileAppsController } from './mobile-apps.controller';
import { MobileAppsService } from './mobile-apps.service';

@Module({
  imports: [CoreModule, UsersModule],
  controllers: [MobileAppsController],
  providers: [MobileAppsService],
  exports: [MobileAppsService],
})
export class MobileAppsModule {}
