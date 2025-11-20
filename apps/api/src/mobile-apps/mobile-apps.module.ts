import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileAppsController } from './mobile-apps.controller';
import { MobileAppsService } from './mobile-apps.service';
import { MobileApp } from './entities/mobile-app.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MobileApp])],
  controllers: [MobileAppsController],
  providers: [MobileAppsService],
  exports: [MobileAppsService],
})
export class MobileAppsModule {}
