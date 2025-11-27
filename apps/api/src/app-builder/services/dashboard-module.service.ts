import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleEntity } from '../entities/dashboard-module.entity';
import { DashboardModuleDto } from '../dto/dashboard-module.dto';

@Injectable()
export class DashboardModuleService {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly dashboardModuleRepository: Repository<ModuleEntity>,
  ) {}

  async findAll(): Promise<DashboardModuleDto[]> {
    const modules = await this.dashboardModuleRepository.find({
      select: ['no', 'label'],
      order: { no: 'ASC' },
    });

    return modules.map((module) => ({
      value: module.no,
      label: module.label,
    }));
  }

  async findById(id: string): Promise<DashboardModuleDto | null> {
    const module = await this.dashboardModuleRepository.findOne({
      where: { no: id },
      select: ['no', 'label'],
    });

    if (!module) {
      return null;
    }

    return {
      value: module.no,
      label: module.label,
    };
  }

  async validateModuleExists(moduleId: string): Promise<boolean> {
    const count = await this.dashboardModuleRepository.count({
      where: { no: moduleId },
    });
    return count > 0;
  }
}
