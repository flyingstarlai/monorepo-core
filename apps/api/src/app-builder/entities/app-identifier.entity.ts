import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TC_APP_IDENTIFIERS')
export class MobileAppIdentifier {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'id' })
  id: string;

  @Column({ type: 'nvarchar', length: 100, name: 'app_id' })
  appId: string;

  @Column({ type: 'nvarchar', length: 200, name: 'package_name' })
  packageName: string;

  @Column({ type: 'nvarchar', length: 50, name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
