import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsEntity, DocumentKindEntity } from './entities';
import { DocumentsService, DocumentKindsService } from './documents.service';
import {
  DocumentsController,
  DocumentKindsController,
} from './documents.controller';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentsEntity, DocumentKindEntity]),
    MinioModule,
  ],
  controllers: [DocumentsController, DocumentKindsController],
  providers: [DocumentsService, DocumentKindsService],
  exports: [DocumentsService, DocumentKindsService],
})
export class DocumentsModule {}
