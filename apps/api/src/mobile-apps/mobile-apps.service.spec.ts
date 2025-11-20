import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileAppsService } from './mobile-apps.service';
import { MobileApp } from './entities/tc-app-user.entity';
import { MobileAppOverviewDto } from './dto/mobile-app-overview.dto';

describe('MobileAppsService', () => {
  let service: MobileAppsService;
  let repository: Repository<MobileApp>;

  const mockMobileApps: MobileApp[] = [
    {
      id: '1',
      app_id: 'tcsmart',
      app_name: '設備機台維修結束',
      app_version: '0.4.30',
      module: null,
      token: 'token1',
      name: 'test',
      company: 'ls',
      is_active: true,
      userid: 'user1',
      username: 'username1',
      useremail: 'user1@example.com',
    },
    {
      id: '2',
      app_id: 'tcsmart',
      app_name: '設備機台維修結束',
      app_version: '0.4.28',
      module: null,
      token: 'token2',
      name: 'test2',
      company: '',
      is_active: false,
      userid: 'user2',
      username: 'username2',
      useremail: '',
    },
    {
      id: '3',
      app_id: 'tcsmart',
      app_name: '訂貨新增',
      app_version: '0.4.35',
      module: null,
      token: 'token3',
      name: 'LL測試',
      company: '林商行',
      is_active: true,
      userid: 'user3',
      username: '',
      useremail: 'user3@example.com',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileAppsService,
        {
          provide: getRepositoryToken(MobileApp),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MobileAppsService>(MobileAppsService);
    repository = module.get<Repository<MobileApp>>(
      getRepositoryToken(MobileApp),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMobileAppsOverview', () => {
    it('should aggregate mobile apps correctly', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue(mockMobileApps);

      const result = await service.getMobileAppsOverview();

      expect(result).toHaveLength(2);

      // First app group
      const app1 = result.find((app) => app.appName === '設備機台維修結束');
      expect(app1).toBeDefined();
      expect(app1!.appId).toBe('tcsmart');
      expect(app1!.latestVersion).toBe('0.4.30');
      expect(app1!.versions).toEqual(
        expect.arrayContaining(['0.4.30', '0.4.28']),
      );
      expect(app1!.activeDevices).toBe(1);
      expect(app1!.totalDevices).toBe(2);
      expect(app1!.uniqueUsers).toBe(2);
      expect(app1!.companies).toBe(1);

      // Second app group
      const app2 = result.find((app) => app.appName === '訂貨新增');
      expect(app2).toBeDefined();
      expect(app2!.appId).toBe('tcsmart');
      expect(app2!.latestVersion).toBe('0.4.35');
      expect(app2!.versions).toEqual(['0.4.35']);
      expect(app2!.activeDevices).toBe(1);
      expect(app2!.totalDevices).toBe(1);
      expect(app2!.uniqueUsers).toBe(1);
      expect(app2!.companies).toBe(1);
    });

    it('should handle empty data', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.getMobileAppsOverview();

      expect(result).toHaveLength(0);
    });

    it('should handle semantic version comparison correctly', async () => {
      const versionTestApps: MobileApp[] = [
        {
          id: '1',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.2.3',
          module: null,
          token: 'token1',
          name: 'test',
          company: '',
          is_active: true,
          userid: 'user1',
          username: 'username1',
          useremail: 'user1@example.com',
        },
        {
          id: '2',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.10.0',
          module: null,
          token: 'token2',
          name: 'test2',
          company: '',
          is_active: true,
          userid: 'user2',
          username: 'username2',
          useremail: 'user2@example.com',
        },
        {
          id: '3',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '2.0.0',
          module: null,
          token: 'token3',
          name: 'test3',
          company: '',
          is_active: true,
          userid: 'user3',
          username: 'username3',
          useremail: 'user3@example.com',
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(versionTestApps);

      const result = await service.getMobileAppsOverview();

      expect(result).toHaveLength(1);
      expect(result[0].latestVersion).toBe('2.0.0');
    });

    it('should count unique users correctly with different user identification fields', async () => {
      const userTestApps: MobileApp[] = [
        {
          id: '1',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token1',
          name: 'test',
          company: '',
          is_active: true,
          userid: 'user1',
          username: '',
          useremail: '',
        },
        {
          id: '2',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token2',
          name: 'test2',
          company: '',
          is_active: true,
          userid: '',
          username: 'user2',
          useremail: '',
        },
        {
          id: '3',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token3',
          name: 'test3',
          company: '',
          is_active: true,
          userid: '',
          username: '',
          useremail: 'user3@example.com',
        },
        {
          id: '4',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token4',
          name: 'test4',
          company: '',
          is_active: true,
          userid: 'user1', // Duplicate userid
          username: '',
          useremail: '',
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(userTestApps);

      const result = await service.getMobileAppsOverview();

      expect(result).toHaveLength(1);
      expect(result[0].uniqueUsers).toBe(3); // user1, user2, user3@example.com
    });

    it('should count distinct companies correctly', async () => {
      const companyTestApps: MobileApp[] = [
        {
          id: '1',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token1',
          name: 'test',
          company: 'Company A',
          is_active: true,
          userid: 'user1',
          username: '',
          useremail: '',
        },
        {
          id: '2',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token2',
          name: 'test2',
          company: 'Company B',
          is_active: true,
          userid: 'user2',
          username: '',
          useremail: '',
        },
        {
          id: '3',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token3',
          name: 'test3',
          company: 'Company A', // Duplicate
          is_active: true,
          userid: 'user3',
          username: '',
          useremail: '',
        },
        {
          id: '4',
          app_id: 'test',
          app_name: 'Test App',
          app_version: '1.0.0',
          module: null,
          token: 'token4',
          name: 'test4',
          company: '', // Empty company should not count
          is_active: true,
          userid: 'user4',
          username: '',
          useremail: '',
        },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(companyTestApps);

      const result = await service.getMobileAppsOverview();

      expect(result).toHaveLength(1);
      expect(result[0].companies).toBe(2); // Company A, Company B
    });
  });
});
