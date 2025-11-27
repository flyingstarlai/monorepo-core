import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('TC_DASHBOARD_MODULE')
export class ModuleEntity {
  @PrimaryColumn({ length: 50 })
  no: string;

  @Column({ length: 50 })
  label: string;

  @Column({ length: 50, name: 'app_title' })
  appTitle: string;

  @Column({ length: 50 })
  query: string;
}
