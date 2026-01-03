import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentStageEntity } from './document-stage.entity';

@Entity('TC_APP_DOCS')
export class DocumentsEntity {
  @PrimaryColumn({ name: 'id', length: '20' })
  id: string;

  @Column({ name: 'stage_id', length: '20', nullable: true })
  stageId: string;

  @Column({ name: 'document_kind', length: '20', nullable: true })
  documentKind: string;

  @Column({ name: 'document_number', length: '20', unique: true })
  documentNumber: string;

  @Column({ name: 'document_name', length: '50', nullable: true })
  documentName: string;

  @Column({ name: 'office_file_path', length: '255', nullable: true })
  officeFilePath: string;

  @Column({
    name: 'pdf_file_path',
    length: '255',
    nullable: true,
    select: false,
  })
  pdfFilePath: string;

  @Column({
    name: 'document_access_level',
    type: 'int',
    nullable: true,
    default: 1,
  })
  documentAccessLevel: number;

  @Column({ name: 'version', length: '10', nullable: true })
  version: string;

  @Column({ name: 'created_by', length: '50', nullable: true })
  createdBy: string;

  @Column({ name: 'created_at_user', length: '50', nullable: true })
  createdAtUser: string;

  @Column({ name: 'modified_by', length: '50', nullable: true })
  modifiedBy: string;

  @Column({ name: 'modified_at_user', length: '50', nullable: true })
  modifiedAtUser: string;

  @Column({ name: 'downloaded_by', length: '50', nullable: true })
  downloadedBy: string;

  @Column({ name: 'downloaded_at_user', length: '50', nullable: true })
  downloadedAtUser: string;

  @ManyToOne(() => DocumentStageEntity, { nullable: true })
  @JoinColumn({ name: 'stage_id' })
  stage: DocumentStageEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
