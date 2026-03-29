const { DataSource } = require('typeorm');

module.exports = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'AccountManager',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/users/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
  cli: {
    entitiesDir: 'src/users/entities',
    migrationsDir: 'src/migrations',
  },
});
