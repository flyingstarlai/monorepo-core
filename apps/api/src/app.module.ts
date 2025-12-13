import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.config';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MobileAppsModule } from './mobile-apps/mobile-apps.module';
import { AppBuilderModule } from './app-builder/app-builder.module';
import { GroupsModule } from './groups/groups.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CoreModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    DashboardModule,
    MobileAppsModule,
    ...(process.env.FEATURE_APP_BUILDER === 'true' ? [AppBuilderModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
