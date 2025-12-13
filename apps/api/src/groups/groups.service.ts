import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Group } from './entities/group.entity';
import { UserGroupMembership } from './entities/user-group-membership.entity';
import { User } from '../users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupMemberResponseDto } from './dto/group-member-response.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(UserGroupMembership)
    private readonly membershipRepository: Repository<UserGroupMembership>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createDto: CreateGroupDto): Promise<GroupResponseDto> {
    const name = this.normalizeName(createDto.name);
    await this.ensureGroupNameUnique(name);

    const group = this.groupsRepository.create({
      id: `group_${nanoid(12)}`,
      name,
      description: this.normalizeDescription(createDto.description),
    });

    const saved = await this.groupsRepository.save(group);
    return GroupResponseDto.fromEntity(saved, 0);
  }

  async findAll(): Promise<GroupResponseDto[]> {
    const groups = await this.groupsRepository.find({
      order: { name: 'ASC' },
      relations: ['memberships'],
    });

    return groups.map((group) =>
      GroupResponseDto.fromEntity(group, group.memberships?.length ?? 0),
    );
  }

  async findOne(id: string): Promise<GroupResponseDto> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['memberships'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return GroupResponseDto.fromEntity(group, group.memberships?.length ?? 0);
  }

  async update(
    id: string,
    updateDto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    const group = await this.ensureGroupExists(id);

    if (updateDto.name) {
      const normalized = this.normalizeName(updateDto.name);
      if (normalized !== group.name) {
        await this.ensureGroupNameUnique(normalized, id);
        group.name = normalized;
      }
    }

    if (updateDto.description !== undefined) {
      group.description = this.normalizeDescription(updateDto.description);
    }

    if (updateDto.isActive !== undefined) {
      group.isActive = updateDto.isActive;
    }

    await this.groupsRepository.save(group);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.ensureGroupExists(id);
    await this.groupsRepository.delete(id);
  }

  async listMembers(groupId: string): Promise<GroupMemberResponseDto[]> {
    await this.ensureGroupExists(groupId);

    const memberships = await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.user', 'user')
      .where('membership.groupId = :groupId', { groupId })
      .orderBy('user.fullName', 'ASC')
      .getMany();

    return memberships.map((membership) =>
      GroupMemberResponseDto.fromMembership(membership),
    );
  }

  async addUsers(
    groupId: string,
    userIds: string[],
  ): Promise<GroupMemberResponseDto[]> {
    await this.ensureGroupExists(groupId);

    const uniqueUserIds = Array.from(
      new Set((userIds || []).map((id) => id?.trim()).filter(Boolean)),
    );

    if (!uniqueUserIds.length) {
      throw new BadRequestException('At least one userId is required');
    }

    const existingUsers = await this.usersRepository.find({
      where: { id: In(uniqueUserIds) },
    });

    if (existingUsers.length !== uniqueUserIds.length) {
      throw new NotFoundException('One or more users were not found');
    }

    const existingMemberships = await this.membershipRepository.find({
      where: {
        groupId,
        userId: In(uniqueUserIds),
      },
    });
    const existingUserIds = new Set(existingMemberships.map((m) => m.userId));

    const newMemberships = uniqueUserIds
      .filter((userId) => !existingUserIds.has(userId))
      .map((userId) =>
        this.membershipRepository.create({
          id: `membership_${nanoid(12)}`,
          userId,
          groupId,
        }),
      );

    if (newMemberships.length) {
      await this.membershipRepository.save(newMemberships);
    }

    return this.listMembers(groupId);
  }

  async removeUser(groupId: string, userId: string): Promise<void> {
    await this.ensureGroupExists(groupId);

    const membership = await this.membershipRepository.findOne({
      where: { groupId, userId },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this group');
    }

    await this.membershipRepository.delete(membership.id);
  }

  private async ensureGroupExists(id: string): Promise<Group> {
    const group = await this.groupsRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  private async ensureGroupNameUnique(name: string, excludeId?: string) {
    const queryBuilder = this.groupsRepository
      .createQueryBuilder('grp')
      .where('LOWER(grp.name) = LOWER(:name)', { name });

    if (excludeId) {
      queryBuilder.andWhere('grp.id != :excludeId', { excludeId });
    }

    const existing = await queryBuilder.getOne();
    if (existing) {
      throw new BadRequestException('Group name already exists');
    }
  }

  private normalizeName(name: string): string {
    return name.trim();
  }

  private normalizeDescription(description?: string | null): string | null {
    if (description === undefined || description === null) {
      return null;
    }
    const trimmed = description.trim();
    return trimmed.length ? trimmed : null;
  }
}
