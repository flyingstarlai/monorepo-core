import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TC_APP_ACCOUNT')
export class User {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'id' })
  id: string;

  @Column({ type: 'nvarchar', length: 50, unique: true, name: 'username' })
  username: string;

  @Column({ type: 'nvarchar', length: 100, name: 'password' })
  password: string;

  @Column({ type: 'nvarchar', length: 20, default: "'user'", name: 'role' })
  role: 'admin' | 'manager' | 'user';

  @Column({ type: 'nvarchar', length: 100, name: 'full_name' })
  fullName: string;

  @Column({ type: 'nvarchar', length: 20, name: 'dept_no' })
  deptNo: string;

  @Column({ type: 'nvarchar', length: 100, name: 'dept_name' })
  deptName: string;

  @Column({ type: 'bit', default: 1, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @CreateDateColumn({
    type: 'datetime2',
    default: () => 'GETDATE()',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime2',
    default: () => 'GETDATE()',
    name: 'updated_at',
  })
  updatedAt: Date;
}
