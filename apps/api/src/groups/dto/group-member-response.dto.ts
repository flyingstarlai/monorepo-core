import { UserGroupMembership } from '../entities/user-group-membership.entity';

export class GroupMemberResponseDto {
  id: string;
  username: string;
  fullName: string;
  role: string;
  deptNo: string;
  deptName: string;
  isActive: boolean;
  membershipCreatedAt: Date;

  static fromMembership(
    membership: UserGroupMembership,
  ): GroupMemberResponseDto {
    return {
      id: membership.userId,
      username: membership.user?.username ?? '',
      fullName: membership.user?.fullName ?? '',
      role: membership.user?.role ?? '',
      deptNo: membership.user?.deptNo ?? '',
      deptName: membership.user?.deptName ?? '',
      isActive: membership.user?.isActive ?? false,
      membershipCreatedAt: membership.createdAt,
    };
  }
}
