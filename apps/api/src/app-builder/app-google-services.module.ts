import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileAppIdentifier } from './entities/app-identifier.entity';
import { MobileAppGoogleServicesService } from './services/app-google-services.service';
import { MobileAppGoogleServicesController } from './controllers/app-google-services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MobileAppIdentifier])],
  controllers: [MobileAppGoogleServicesController],
  providers: [MobileAppGoogleServicesService],
  exports: [MobileAppGoogleServicesService],
})
export class AppGoogleServicesModule {}
