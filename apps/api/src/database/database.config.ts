import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { LoginHistory } from '../users/entities/login-history.entity';

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
        entities: [User, LoginHistory],
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
        migrations: ['dist/migrations/*.js'],
        migrationsRun: false,
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
