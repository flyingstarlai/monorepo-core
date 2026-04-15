import { DataSource } from 'typeorm';
import { User, LoginHistory } from '@repo/api';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'MonoCore',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, LoginHistory],
  migrations: ['src/migrations/*.ts'],
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
});
