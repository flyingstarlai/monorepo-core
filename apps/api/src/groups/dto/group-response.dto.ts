import { Group } from '../entities/group.entity';

export class GroupResponseDto {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;

  static fromEntity(group: Group, memberCount?: number): GroupResponseDto {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      memberCount: memberCount ?? group.memberships?.length ?? 0,
    };
  }
}
