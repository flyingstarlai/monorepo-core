import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import {
  MobileAppDefinition,
  MobileAppBuild,
  MobileAppIdentifier,
} from './app-builder/entities/index';
import { Group } from './groups/entities/group.entity';
import { UserGroupMembership } from './groups/entities/user-group-membership.entity';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_MIGRATION_HOST || 'localhost',
  port: parseInt(process.env.DB_MIGRATION_PORT || '1433'),
  username: process.env.DB_UMIGRATION_SERNAME || 'sa',
  password: process.env.DB_MIGRATION_PASSWORD || '',
  database: process.env.DB_MIGRATION_DATABASE || 'AccountManager',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    MobileAppDefinition,
    MobileAppBuild,
    MobileAppIdentifier,
    Group,
    UserGroupMembership,
  ],
  migrations: ['src/migrations/*.ts'],
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
});
