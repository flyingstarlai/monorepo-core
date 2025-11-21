import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('TC_ACCOUNT_LOGIN')
export class LoginHistory {
  @PrimaryColumn({ type: 'uuid', name: '_key' })
  key: string;

  @Column({ name: 'username', type: 'nvarchar', length: 50 })
  username: string;

  @Column({ name: 'app_id', type: 'nvarchar', length: 50 })
  appId: string;

  @Column({ name: 'success', type: 'bit', default: false })
  success: boolean;

  @Column({
    name: 'failure_reason',
    type: 'nvarchar',
    length: 200,
    nullable: true,
  })
  failureReason: string;

  @Column({ name: 'login_at', type: 'datetime' })
  loginAt: Date;

  @Column({ name: 'account_id', type: 'nvarchar', length: 50, nullable: true })
  accountId: string;

  @Column({ name: 'app_name', type: 'nvarchar', length: 50, nullable: true })
  appName: string;

  @Column({ name: 'app_version', type: 'nvarchar', length: 50, nullable: true })
  appVersion: string;

  @Column({ name: 'app_module', type: 'nvarchar', length: 50, nullable: true })
  appModule: string;
}
