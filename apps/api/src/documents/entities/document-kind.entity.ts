import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TC_DOC_KINDS')
export class DocumentKindEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'code', length: '20', unique: true })
  code: string;

  @Column({ name: 'name', length: '50' })
  name: string;

  @Column({ name: 'description', length: '200', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'created_by', length: '20', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'modified_by', length: '20', nullable: true })
  modifiedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
