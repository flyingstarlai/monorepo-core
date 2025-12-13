import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserGroupMembership } from './user-group-membership.entity';

@Entity('TC_APP_USER_GROUP')
export class Group {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'id' })
  id: string;

  @Column({ type: 'nvarchar', length: 100, unique: true, name: 'name' })
  name: string;

  @Column({
    type: 'nvarchar',
    length: 255,
    nullable: true,
    name: 'description',
  })
  description?: string | null;

  @Column({ type: 'bit', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({
    type: 'datetime2',
    name: 'created_at',
    default: () => 'GETDATE()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime2',
    name: 'updated_at',
    default: () => 'GETDATE()',
  })
  updatedAt: Date;

  @OneToMany(() => UserGroupMembership, (membership) => membership.group)
  memberships: UserGroupMembership[];
}
