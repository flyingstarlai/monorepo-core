import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsEntity, DocumentStageEntity } from './entities';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentStageService } from './document-stage.service';
import { DocumentStageController } from './document-stage.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentsEntity, DocumentStageEntity]),
    MulterModule.register(multerConfig),
  ],
  controllers: [DocumentsController, DocumentStageController],
  providers: [DocumentsService, DocumentStageService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
