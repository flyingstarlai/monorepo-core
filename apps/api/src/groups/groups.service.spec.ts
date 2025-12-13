import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { User } from '../users/entities/user.entity';
import { UserGroupMembership } from './entities/user-group-membership.entity';

describe('GroupsService', () => {
  let service: GroupsService;
  let groupsRepository: Repository<Group>;
  let membershipRepository: Repository<UserGroupMembership>;
  let usersRepository: Repository<User>;
  let groupsRepositoryMock: any;
  let membershipRepositoryMock: any;
  let usersRepositoryMock: any;
  let groupQueryBuilder: any;

  beforeEach(() => {
    groupQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    const membershipQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    groupsRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(groupQueryBuilder),
    };
    groupsRepository = groupsRepositoryMock as Repository<Group>;

    membershipRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(membershipQueryBuilder),
    };
    membershipRepository =
      membershipRepositoryMock as Repository<UserGroupMembership>;

    usersRepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    usersRepository = usersRepositoryMock as Repository<User>;

    service = new GroupsService(
      groupsRepository,
      membershipRepository,
      usersRepository,
    );
  });

  it('creates a group with unique name', async () => {
    const groupEntity = {
      id: 'g1',
      name: 'Ops',
      memberships: [],
    } as Group;
    groupsRepositoryMock.create.mockReturnValue(groupEntity);
    groupsRepositoryMock.save.mockResolvedValue(groupEntity);

    const result = await service.create({ name: 'Ops' });

    expect(result.name).toBe('Ops');
    expect(groupsRepositoryMock.save).toHaveBeenCalledWith(groupEntity);
  });

  it('throws when creating duplicate group name', async () => {
    groupQueryBuilder.getOne.mockResolvedValueOnce({ id: 'existing' });

    await expect(service.create({ name: 'Ops' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('adds users to group excluding duplicates', async () => {
    groupsRepositoryMock.findOne.mockResolvedValue({ id: 'g1' });
    usersRepositoryMock.find.mockResolvedValue([
      { id: 'u1' } as User,
      { id: 'u2' } as User,
    ]);
    membershipRepositoryMock.find.mockResolvedValue([{ userId: 'u1' }]);
    membershipRepositoryMock.create.mockImplementation((data) => data);

    const listMembersSpy = jest
      .spyOn(service, 'listMembers')
      .mockResolvedValue([]);

    const result = await service.addUsers('g1', ['u1', 'u2']);

    expect(membershipRepositoryMock.save).toHaveBeenCalledWith([
      { userId: 'u2', groupId: 'g1' },
    ]);
    expect(listMembersSpy).toHaveBeenCalledWith('g1');
    expect(result).toEqual([]);
  });
});
