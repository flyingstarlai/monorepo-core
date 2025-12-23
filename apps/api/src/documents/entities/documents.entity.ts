import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentKindEntity } from './document-kind.entity';

@Entity('TC_APP_DOCS')
export class DocumentsEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => DocumentKindEntity, { nullable: true })
  @JoinColumn({ name: 'document_kind_id' })
  documentKind?: DocumentKindEntity;

  @Column({ name: 'document_kind', length: '10', nullable: true })
  documentKindCode: string;

  @Column({ name: 'document_number', length: '20', nullable: true })
  documentNumber: string;

  @Column({ name: 'document_name', length: '50', nullable: true })
  documentName: string;

  @Column({ name: 'office_file_path', length: '100', nullable: true })
  officeFilePath: string;

  @Column({ name: 'pdf_file_path', length: '100', nullable: true })
  pdfFilePath: string;

  @Column({ name: 'version', length: '10', nullable: true })
  version: string;

  @Column({ name: 'created_by', length: '20', nullable: true })
  createdBy: string;

  @Column({ name: 'created_at_user', length: '20', nullable: true })
  createdAtUser: string;

  @Column({ name: 'modified_by', length: '20', nullable: true })
  modifiedBy: string;

  @Column({ name: 'modified_at_user', length: '20', nullable: true })
  modifiedAtUser: string;

  @Column({ name: 'downloaded_by', length: '20', nullable: true })
  downloadedBy: string;

  @Column({ name: 'downloaded_at_user', length: '20', nullable: true })
  downloadedAtUser: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
