import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('TC_APP_USER')
export class MobileApp {
  @PrimaryColumn({ type: 'nvarchar', length: 50 })
  id: string;

  @Column({ type: 'nvarchar', length: 50, default: 'tcsmart', name: 'app_id' })
  appId: string;

  @Column({ type: 'nvarchar', length: 50, name: 'app_name' })
  appName: string;

  @Column({ type: 'nvarchar', length: 50, name: 'app_version' })
  appVersion: string;

  @Column({ type: 'nvarchar', length: 500 })
  token: string;

  @Column({ type: 'nvarchar', length: 50 })
  name: string;

  @Column({ type: 'nvarchar', length: 50, default: '' })
  company: string;

  @Column({ type: 'bit', default: true, name: 'is_active' })
  isActive: boolean;
}
