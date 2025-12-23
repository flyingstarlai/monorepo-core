import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { MobileApp } from '../mobile-apps/entities/mobile-app.entity';
import { LoginHistory } from '../users/entities/login-history.entity';
import {
  MobileAppDefinition,
  MobileAppBuild,
  MobileAppIdentifier,
} from '../app-builder/entities/index';
import { ModuleEntity } from '../app-builder/entities/dashboard-module.entity';
import { Group } from '../groups/entities/group.entity';
import { UserGroupMembership } from '../groups/entities/user-group-membership.entity';
import { DocumentsEntity } from '../documents/entities/documents.entity';
import { DocumentKindEntity } from '../documents/entities/document-kind.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql' as const,
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '1433'),
        username: configService.get<string>('DB_USERNAME') || 'sa',
        password: configService.get<string>('DB_PASSWORD') || '',
        database: configService.get<string>('DB_DATABASE') || 'AccountManager',
        entities: [
          User,
          MobileApp,
          LoginHistory,
          MobileAppDefinition,
          MobileAppBuild,
          MobileAppIdentifier,
          ModuleEntity,
          Group,
          UserGroupMembership,
          DocumentsEntity,
          DocumentKindEntity,
        ],
        synchronize: false, // Don't auto-sync since we have existing table
        logging: configService.get<string>('NODE_ENV') === 'development',
        migrations: ['dist/migrations/*.js'],
        migrationsRun: false, // We'll run migrations manually
        options: {
          encrypt: configService.get<string>('DB_ENCRYPT') === 'true',
          trustServerCertificate:
            configService.get<string>('DB_TRUST_CERT') === 'true',
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
