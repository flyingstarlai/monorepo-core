import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsEntity } from './entities';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentsEntity]),
    MulterModule.register(multerConfig),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
