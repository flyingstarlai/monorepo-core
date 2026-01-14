import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MobileAppDefinition } from './app-definition.entity';

@Entity('TC_APP_COMPANY')
export class Company {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'company_code' })
  companyCode: string;

  @Column({ type: 'nvarchar', length: 100, name: 'company_name' })
  companyName: string;

  @Column({ type: 'bit', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({
    type: 'datetime2',
    default: () => 'SYSDATETIME()',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime2',
    default: () => 'SYSDATETIME()',
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToMany(() => MobileAppDefinition, (definition) => definition.companyCode)
  appDefinitions: MobileAppDefinition[];
}
