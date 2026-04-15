import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from '@repo/api';
import { formatDateUTC8 } from '../utils/date-formatter';

jest.mock('../utils/id-generator', () => ({
  IdGenerator: {
    generateUserId: () => 'user_mockid12345',
    generateCustomId: (prefix: string) => `${prefix}_mockid12345`,
  },
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUser: Partial<User> = {
    id: 'user_abc123',
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    fullName: 'Test User',
    role: 'user',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, JwtModule],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('findOne', () => {
    it('should return a user response DTO when user exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findOne('user_abc123');

      expect(result).toEqual({
        id: 'user_abc123',
        username: 'testuser',
        fullName: 'Test User',
        role: 'user',
        createdAt: formatDateUTC8(mockUser.createdAt!),
        updatedAt: formatDateUTC8(mockUser.updatedAt!),
      });
    });

    it('should return null when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user entity when found', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
    });

    it('should return null when not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nobody');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return mapped user response DTOs', async () => {
      userRepo.find.mockResolvedValue([mockUser as User]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user_abc123');
      expect(result[0].username).toBe('testuser');
    });
  });

  describe('remove', () => {
    it('should remove user when found', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as User);
      userRepo.remove.mockResolvedValue(mockUser as User);

      await service.remove('user_abc123');

      expect(userRepo.remove).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('searchUsers', () => {
    it('should search by username and fullName', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      };
      userRepo.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.searchUsers('test');

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.username LIKE :query OR user.fullName LIKE :query',
        { query: '%test%' },
      );
      expect(result).toHaveLength(1);
    });
  });
});
