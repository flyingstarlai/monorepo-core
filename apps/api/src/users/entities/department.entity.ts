import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TC_APP_DEPT')
export class Department {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'dept_no' })
  deptNo: string;

  @Column({ type: 'nvarchar', length: 100, name: 'dept_name' })
  deptName: string;

  @Column({
    type: 'nvarchar',
    length: 50,
    nullable: true,
    name: 'parent_dept_no',
  })
  parentDeptNo: string | null;

  @Column({ type: 'int', name: 'dept_level' })
  deptLevel: number;

  @Column({ type: 'nvarchar', length: 50, nullable: true, name: 'manager_id' })
  managerId: string | null;

  @Column({ type: 'bit', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'int', name: 'sort_no', default: 0 })
  sortNo: number;

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
}
