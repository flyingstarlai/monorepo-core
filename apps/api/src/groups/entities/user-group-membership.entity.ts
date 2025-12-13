import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';

@Entity('TC_APP_USER_GROUP_MEMBERS')
@Unique(['userId', 'groupId'])
export class UserGroupMembership {
  @PrimaryColumn({ type: 'nvarchar', length: 50, name: 'id' })
  id: string;

  @Column({ type: 'nvarchar', length: 50, name: 'user_id' })
  userId: string;

  @Column({ type: 'uniqueidentifier', name: 'group_id' })
  groupId: string;

  @ManyToOne(() => User, (user) => user.groupMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Group, (group) => group.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @CreateDateColumn({
    type: 'datetime2',
    name: 'created_at',
    default: () => 'GETDATE()',
  })
  createdAt: Date;
}
