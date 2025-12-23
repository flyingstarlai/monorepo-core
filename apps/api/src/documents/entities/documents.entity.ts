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

  // Keep the old string field for backward compatibility during migration
  @Column({ name: 'document_kind', length: '10', nullable: true })
  dockind: string;

  @Column({ name: 'document_number', length: '20', nullable: true })
  docno: string;

  @Column({ name: 'document_name', length: '50', nullable: true })
  docna: string;

  @Column({ name: 'office_file_path', length: '100', nullable: true })
  docfile: string;

  @Column({ name: 'pdf_file_path', length: '100', nullable: true })
  docfilepdf: string;

  @Column({ name: 'version', length: '10', nullable: true })
  docver: string;

  @Column({ name: 'created_by', length: '20', nullable: true })
  docCreator: string;

  @Column({ name: 'created_at_user', length: '20', nullable: true })
  docCreate: string;

  @Column({ name: 'modified_by', length: '20', nullable: true })
  docModifier: string;

  @Column({ name: 'modified_at_user', length: '20', nullable: true })
  docModiDate: string;

  @Column({ name: 'downloaded_by', length: '20', nullable: true })
  docLoader: string;

  @Column({ name: 'downloaded_at_user', length: '20', nullable: true })
  docLoaderDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
