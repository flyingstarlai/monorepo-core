import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DashboardModuleController } from './controllers/dashboard-module.controller';
import { MobileAppBuilderController } from './controllers/app-builder.controller';
import { MobileAppGoogleServicesController } from './controllers/app-google-services.controller';
import { MobileAppAppIdsController } from './controllers/app-app-ids.controller';
import { DashboardModuleService } from './services/dashboard-module.service';
import { MobileAppDefinitionService } from './services/app-definition.service';
import { MobileAppBuildService } from './services/app-build.service';
import { JenkinsService } from './services/jenkins.service';
import { MobileAppGoogleServicesService } from './services/app-google-services.service';
import { ModuleEntity } from './entities/dashboard-module.entity';
import { MobileAppDefinition } from './entities/app-definition.entity';
import { MobileAppBuild } from './entities/app-build.entity';
import { MobileAppIdentifier } from './entities/app-identifier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModuleEntity,
      MobileAppDefinition,
      MobileAppBuild,
      MobileAppIdentifier,
    ]),
    ConfigModule,
  ],
  controllers: [
    DashboardModuleController,
    MobileAppBuilderController,
    MobileAppGoogleServicesController,
    MobileAppAppIdsController,
  ],
  providers: [
    DashboardModuleService,
    MobileAppDefinitionService,
    MobileAppBuildService,
    JenkinsService,
    MobileAppGoogleServicesService,
  ],
  exports: [
    DashboardModuleService,
    MobileAppDefinitionService,
    MobileAppBuildService,
    JenkinsService,
    MobileAppGoogleServicesService,
  ],
})
export class AppBuilderModule {}
