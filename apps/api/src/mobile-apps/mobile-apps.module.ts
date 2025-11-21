import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileAppsController } from './mobile-apps.controller';
import { MobileAppsService } from './mobile-apps.service';
import { MobileApp } from './entities/mobile-app.entity';
import { LoginHistory } from './entities/login-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MobileApp, LoginHistory])],
  controllers: [MobileAppsController],
  providers: [MobileAppsService],
  exports: [MobileAppsService],
})
export class MobileAppsModule {}
