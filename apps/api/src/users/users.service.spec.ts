import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { LoginHistory } from './entities/login-history.entity';
import { formatDateUTC8 } from '../utils/date-formatter';

describe('UsersService', () => {
  let service: UsersService;
  let loginHistoryRepo: jest.Mocked<Repository<LoginHistory>>;

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
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LoginHistory),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    loginHistoryRepo = module.get(getRepositoryToken(LoginHistory));
  });

  describe('getLatestMobileLoginForUser', () => {
    it('should return null values when no login history exists', async () => {
      loginHistoryRepo.findOne.mockResolvedValue(null);

      const result = await (service as any).getLatestMobileLoginForUser(
        'user123',
      );

      expect(result).toEqual({
        lastMobileLoginAt: null,
        lastMobileDeviceId: null,
        lastMobileAppName: null,
        lastMobileAppVersion: null,
        lastMobileAppModule: null,
      });
      expect(loginHistoryRepo.findOne).toHaveBeenCalledWith({
        where: { accountId: 'user123' },
        order: { loginAt: 'DESC' },
        select: ['loginAt', 'appId', 'appName', 'appVersion', 'appModule'],
      });
    });

    it('should return formatted latest login data when history exists', async () => {
      const mockLoginHistory = {
        key: 'log1',
        loginAt: new Date('2024-01-15T10:30:00Z'),
        appId: 'device123',
        appName: 'TestApp',
        appVersion: '1.0.0',
        appModule: 'auth',
        username: 'user123',
        accountId: 'user123',
      } as LoginHistory;
      loginHistoryRepo.findOne.mockResolvedValue(mockLoginHistory);

      const result = await (service as any).getLatestMobileLoginForUser(
        'user123',
      );

      expect(result).toEqual({
        lastMobileLoginAt: formatDateUTC8(mockLoginHistory.loginAt),
        lastMobileDeviceId: 'device123',
        lastMobileAppName: 'TestApp',
        lastMobileAppVersion: '1.0.0',
        lastMobileAppModule: 'auth',
      });
    });
  });

  describe('findLoginHistoryByUserId', () => {
    it('should return empty items when no login history exists', async () => {
      loginHistoryRepo.find.mockResolvedValue([]);

      const result = await service.findLoginHistoryByUserId('user123', 10);

      expect(result).toEqual({ items: [] });
      expect(loginHistoryRepo.find).toHaveBeenCalledWith({
        where: { accountId: 'user123' },
        order: { loginAt: 'DESC' },
        take: 10,
        select: [
          'key',
          'loginAt',
          'success',
          'failureReason',
          'appId',
          'appName',
          'appVersion',
          'appModule',
        ],
      });
    });

    it('should return paginated login history with correct mapping', async () => {
      const mockHistory: LoginHistory[] = [
        {
          key: 'log1',
          loginAt: new Date('2024-01-15T10:30:00Z'),
          success: true,
          failureReason: null,
          appId: 'device1',
          appName: 'TestApp',
          appVersion: '1.0.0',
          appModule: 'auth',
          username: 'user123',
          accountId: 'user123',
        },
        {
          key: 'log2',
          loginAt: new Date('2024-01-14T09:20:00Z'),
          success: false,
          failureReason: 'Invalid credentials',
          appId: 'device2',
          appName: 'TestApp',
          appVersion: '1.0.0',
          appModule: 'auth',
          username: 'user123',
          accountId: 'user123',
        },
      ];
      loginHistoryRepo.find.mockResolvedValue(mockHistory);

      const result = await service.findLoginHistoryByUserId('user123', 50);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({
        userId: 'user123',
        logId: 'log1',
        loginAt: formatDateUTC8(mockHistory[0].loginAt),
        success: true,
        failureReason: null,
        deviceId: 'device1',
        appName: 'TestApp',
        appVersion: '1.0.0',
        appModule: 'auth',
      });
      expect(result.items[1]).toEqual({
        userId: 'user123',
        logId: 'log2',
        loginAt: formatDateUTC8(mockHistory[1].loginAt),
        success: false,
        failureReason: 'Invalid credentials',
        deviceId: 'device2',
        appName: 'TestApp',
        appVersion: '1.0.0',
        appModule: 'auth',
      });
      expect(loginHistoryRepo.find).toHaveBeenCalledWith({
        where: { accountId: 'user123' },
        order: { loginAt: 'DESC' },
        take: 50,
        select: [
          'key',
          'loginAt',
          'success',
          'failureReason',
          'appId',
          'appName',
          'appVersion',
          'appModule',
        ],
      });
    });

    it('should limit to minimum 1 when invalid limit provided', async () => {
      loginHistoryRepo.find.mockResolvedValue([]);

      await service.findLoginHistoryByUserId('user123', 0);

      expect(loginHistoryRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 }),
      );
    });
  });
});
