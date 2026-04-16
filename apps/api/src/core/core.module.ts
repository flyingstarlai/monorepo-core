import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, LoginHistory } from '@repo/api';

@Module({
  imports: [TypeOrmModule.forFeature([User, LoginHistory])],
  exports: [TypeOrmModule],
})
export class CoreModule {}
