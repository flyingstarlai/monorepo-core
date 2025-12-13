import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserGroupMembership } from '../../groups/entities/user-group-membership.entity';

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

  @OneToMany(() => UserGroupMembership, (membership) => membership.user)
  groupMemberships: UserGroupMembership[];
}

export type UserRole = 'admin' | 'manager' | 'user';

export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;
