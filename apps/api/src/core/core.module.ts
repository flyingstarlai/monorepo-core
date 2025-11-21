import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { MobileApp } from '../mobile-apps/entities/mobile-app.entity';
import { LoginHistory } from '../users/entities/login-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, MobileApp, LoginHistory])],
  exports: [TypeOrmModule],
})
export class CoreModule {}
