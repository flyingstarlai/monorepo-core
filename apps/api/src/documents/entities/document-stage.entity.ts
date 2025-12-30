import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TC_APP_DOC_STAGES')
export class DocumentStageEntity {
  @PrimaryColumn({ name: 'id', length: '20' })
  id: string;

  @Column({ name: 'title', length: '100' })
  title: string;

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
