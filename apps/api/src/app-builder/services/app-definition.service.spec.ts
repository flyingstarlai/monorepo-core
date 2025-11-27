import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileAppDefinitionService } from '../services/app-definition.service';
import { MobileAppDefinition } from '../entities/app-definition.entity';
import {
  CreateDefinitionDto,
  UpdateDefinitionDto,
} from '../dto/app-definition.dto';
import { DashboardModuleService } from './dashboard-module.service';

describe('MobileAppDefinitionService', () => {
  let service: MobileAppDefinitionService;
  let repository: Repository<MobileAppDefinition>;
  let dashboardModuleService: DashboardModuleService;

  beforeEach(async () => {
    const mockDashboardModuleService = {
      validateModuleExists: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileAppDefinitionService,
        {
          provide: getRepositoryToken(MobileAppDefinition),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DashboardModuleService,
          useValue: mockDashboardModuleService,
        },
      ],
    }).compile();

    service = module.get<MobileAppDefinitionService>(
      MobileAppDefinitionService,
    );
    repository = module.get<Repository<MobileAppDefinition>>(
      getRepositoryToken(MobileAppDefinition),
    );
    dashboardModuleService = module.get<DashboardModuleService>(
      DashboardModuleService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create definition when module exists', async () => {
      const createDto: CreateDefinitionDto = {
        appId: 'com.test.app',
        appModule: '999',
        serverIp: '192.168.1.1',
      };

      // Mock Date.now to return predictable timestamp
      const mockTimestamp = 1764204619791;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      const expectedId = `def_${mockTimestamp}`;
      const mockDefinition = { id: expectedId, ...createDto };
      jest.spyOn(repository, 'create').mockReturnValue(mockDefinition as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockDefinition as any);

      const result = await service.create(createDto, 'user123');

      expect(dashboardModuleService.validateModuleExists).toHaveBeenCalledWith(
        '999',
      );
      expect(repository.create).toHaveBeenCalledWith({
        id: expectedId,
        ...createDto,
        createdBy: 'user123',
      });
      expect(repository.save).toHaveBeenCalledWith(mockDefinition);
      expect(result).toEqual(mockDefinition);
    });

    it('should throw error when module does not exist', async () => {
      jest
        .spyOn(dashboardModuleService, 'validateModuleExists')
        .mockResolvedValue(false);

      const createDto: CreateDefinitionDto = {
        appName: 'Test App',
        appId: 'com.test.app',
        appModule: '999',
        serverIp: '192.168.1.1',
        googleServicesContent: '{"test": "json"}',
      };

      await expect(service.create(createDto, 'user123')).rejects.toThrow(
        'Module 999 does not exist',
      );
    });
  });

  describe('findAll', () => {
    it('should return all definitions with builds', async () => {
      const mockDefinitions = [
        { id: '1', appName: 'App 1' },
        { id: '2', appName: 'App 2' },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockDefinitions as any);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['builds'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockDefinitions);
    });
  });

  describe('findById', () => {
    it('should return definition when found', async () => {
      const mockDefinition = { id: '1', appName: 'App 1' };
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockDefinition as any);

      const result = await service.findById('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['builds'],
      });
      expect(result).toEqual(mockDefinition);
    });

    it('should return null when not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });
});
