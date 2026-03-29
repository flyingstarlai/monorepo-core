import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ACCOUNT')
export class User {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'id' })
  id: string;

  @Column({ type: 'nvarchar', length: 50, unique: true, name: 'username' })
  username: string;

  @Column({ type: 'nvarchar', length: 100, name: 'password' })
  password: string;

  @Column({ type: 'nvarchar', length: 100, name: 'full_name' })
  fullName: string;

  @Column({ type: 'nvarchar', length: 20, default: "'user'", name: 'role' })
  role: 'admin' | 'user';

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

export type UserRole = 'admin' | 'user';

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;
