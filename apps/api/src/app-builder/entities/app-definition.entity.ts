import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MobileAppBuild } from './app-build.entity';
import { Company } from './company.entity';

@Entity('TC_APP_DEFINITION')
export class MobileAppDefinition {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'id' })
  id: string;

  @Column({ type: 'nvarchar', length: 100, name: 'app_name' })
  appName: string;

  @Column({ type: 'nvarchar', length: 100, name: 'app_id' })
  appId: string;

  @Column({ type: 'nvarchar', length: 50, name: 'app_module' })
  appModule: string;

  @Column({ type: 'nvarchar', length: 45, name: 'server_ip' })
  serverIp: string;

  @Column({
    type: 'nvarchar',
    length: 50,
    name: 'company_code',
    nullable: true,
  })
  companyCode: string;

  @Column({ type: 'nvarchar', length: 50, name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MobileAppBuild, (build) => build.appDefinition)
  builds: MobileAppBuild[];
}
