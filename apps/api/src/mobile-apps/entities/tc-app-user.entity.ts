import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('TC_APP_USER')
export class MobileApp {
  @PrimaryColumn({ type: 'nvarchar', length: 50 })
  id: string;

  @Column({ type: 'nvarchar', length: 50, default: 'tcsmart' })
  app_id: string;

  @Column({ type: 'nvarchar', length: 50 })
  app_name: string;

  @Column({ type: 'nvarchar', length: 50 })
  app_version: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  module: string;

  @Column({ type: 'nvarchar', length: 500 })
  token: string;

  @Column({ type: 'nvarchar', length: 50 })
  name: string;

  @Column({ type: 'nvarchar', length: 50, default: '' })
  company: string;

  @Column({ type: 'bit', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  userid: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  useremail: string;
}
