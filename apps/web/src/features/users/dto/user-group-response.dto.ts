export interface UserGroupResponseDto {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  memberCount: number;
  membershipCreatedAt: string;
}
