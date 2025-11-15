import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: '60.248.245.253',
  port: 1433,
  username: 'sa',
  password: 'dsc',
  database: 'TC_DEV',
  synchronize: false,
  logging: true,
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
