import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileAppsService } from './mobile-apps.service';
import { MobileApp } from './entities/mobile-app.entity';
import { LoginHistory } from './entities/login-history.entity';
import { LoginHistoryQueryDto } from './dto/login-history-query.dto';

describe('MobileAppsService', () => {
  let service: MobileAppsService;
  let mobileAppRepository: Repository<MobileApp>;
  let loginHistoryRepository: Repository<LoginHistory>;

  const mockMobileAppRepository = {
    find: jest.fn(),
  };

  const mockLoginHistoryRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileAppsService,
        {
          provide: getRepositoryToken(MobileApp),
          useValue: mockMobileAppRepository,
        },
        {
          provide: getRepositoryToken(LoginHistory),
          useValue: mockLoginHistoryRepository,
        },
      ],
    }).compile();

    service = module.get<MobileAppsService>(MobileAppsService);
    mobileAppRepository = module.get<Repository<MobileApp>>(
      getRepositoryToken(MobileApp),
    );
    loginHistoryRepository = module.get<Repository<LoginHistory>>(
      getRepositoryToken(LoginHistory),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLoginHistoryByAppId', () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(100),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    beforeEach(() => {
      mockLoginHistoryRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return paginated login history for app', async () => {
      const appId = 'test-app-id';
      const query: LoginHistoryQueryDto = { page: 1, limit: 50 };

      const mockLoginHistoryData = [
        {
          key: '1',
          username: 'user1',
          appId,
          success: true,
          failureReason: null,
          loginAt: new Date('2024-01-01T10:00:00Z'),
          accountId: 'account1',
          appName: 'Test App',
          appVersion: '1.0.0',
          appModule: 'auth',
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockLoginHistoryData);

      const result = await service.getLoginHistoryByAppId(appId, query);

      expect(
        mockLoginHistoryRepository.createQueryBuilder,
      ).toHaveBeenCalledWith('loginHistory');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'loginHistory.appId = :appId',
        { appId },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'loginHistory.loginAt',
        'DESC',
      );
      expect(result.data).toEqual(mockLoginHistoryData);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should apply date range filtering when provided', async () => {
      const appId = 'test-app-id';
      const query: LoginHistoryQueryDto = {
        page: 1,
        limit: 50,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getLoginHistoryByAppId(appId, query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'loginHistory.loginAt >= :startDate',
        { startDate: '2024-01-01T00:00:00.000Z' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'loginHistory.loginAt <= :endDate',
        { endDate: '2024-01-31T23:59:59.999Z' },
      );
    });

    it('should handle pagination correctly', async () => {
      const appId = 'test-app-id';
      const query: LoginHistoryQueryDto = { page: 2, limit: 25 };

      mockQueryBuilder.getCount.mockResolvedValue(60);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getLoginHistoryByAppId(appId, query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(25); // (page - 1) * limit
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(25);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 25,
        total: 60,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should use default pagination values when not provided', async () => {
      const appId = 'test-app-id';
      const query: LoginHistoryQueryDto = {};

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.getLoginHistoryByAppId(appId, query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // (1 - 1) * 50
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(50);
    });
  });
});
