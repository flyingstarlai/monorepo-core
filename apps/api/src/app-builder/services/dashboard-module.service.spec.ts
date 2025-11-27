import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardModuleService } from '../services/dashboard-module.service';
import { ModuleEntity } from '../entities/dashboard-module.entity';
import { DashboardModuleDto } from '../dto/dashboard-module.dto';

describe('DashboardModuleService', () => {
  let service: DashboardModuleService;
  let repository: Repository<ModuleEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardModuleService,
        {
          provide: getRepositoryToken(ModuleEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardModuleService>(DashboardModuleService);
    repository = module.get<Repository<ModuleEntity>>(
      getRepositoryToken(ModuleEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of dashboard modules', async () => {
      const mockModules = [
        { no: '001', label: 'Module 001' },
        { no: '002', label: 'Module 002' },
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockModules as any);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        select: ['no', 'label'],
        order: { no: 'ASC' },
      });
      expect(result).toEqual([
        { value: '001', label: 'Module 001' },
        { value: '002', label: 'Module 002' },
      ]);
    });
  });

  describe('findById', () => {
    it('should return module when found', async () => {
      const mockModule = { no: '001', label: 'Module 001' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockModule as any);

      const result = await service.findById('001');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { no: '001' },
        select: ['no', 'label'],
      });
      expect(result).toEqual({ value: '001', label: 'Module 001' });
    });

    it('should return null when not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('validateModuleExists', () => {
    it('should return true when module exists', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(1);

      const result = await service.validateModuleExists('001');

      expect(repository.count).toHaveBeenCalledWith({
        where: { no: '001' },
      });
      expect(result).toBe(true);
    });

    it('should return false when module does not exist', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(0);

      const result = await service.validateModuleExists('999');

      expect(result).toBe(false);
    });
  });
});
