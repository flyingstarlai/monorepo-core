import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MobileAppGoogleServicesService } from './app-google-services.service';
import { MobileAppIdentifier } from '../entities/app-identifier.entity';

describe('MobileAppGoogleServicesService', () => {
  let service: MobileAppGoogleServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileAppGoogleServicesService,
        {
          provide: getRepositoryToken(MobileAppIdentifier),
          useValue: {
            clear: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MobileAppGoogleServicesService>(
      MobileAppGoogleServicesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseAppIds', () => {
    it('should only extract entries with TCS prefix', async () => {
      const mockContent = JSON.stringify({
        client: [
          {
            client_info: {
              android_client_info: {
                package_name: 'com.example.TCS123.app',
              },
            },
          },
          {
            client_info: {
              android_client_info: {
                package_name: 'com.example.TCS456.app',
              },
            },
          },
          {
            client_info: {
              android_client_info: {
                package_name: 'com.example.regular.app',
              },
            },
          },
        ],
      });

      const result = await service.parseAppIds(mockContent);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        appId: 'TCS123',
        packageName: 'com.example.TCS123.app',
      });
      expect(result[1]).toEqual({
        appId: 'TCS456',
        packageName: 'com.example.TCS456.app',
      });
    });

    it('should return empty array if no TCS entries found', async () => {
      const mockContent = JSON.stringify({
        client: [
          {
            client_info: {
              android_client_info: {
                package_name: 'com.example.regular.app',
              },
            },
          },
          {
            client_info: {
              android_client_info: {
                package_name: 'com.another.normal.app',
              },
            },
          },
        ],
      });

      const result = await service.parseAppIds(mockContent);

      expect(result).toHaveLength(0);
    });

    it('should handle invalid JSON gracefully', async () => {
      const result = await service.parseAppIds('invalid json');

      expect(result).toHaveLength(0);
    });
  });
});
