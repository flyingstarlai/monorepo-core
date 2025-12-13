import type { User } from '../../users/types/user.types';

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupInput {
  name: string;
  description?: string | null;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface GroupMember {
  id: string;
  username: string;
  fullName: string;
  role: User['role'];
  deptNo: string;
  deptName: string;
  isActive: boolean;
  membershipCreatedAt: string;
}
