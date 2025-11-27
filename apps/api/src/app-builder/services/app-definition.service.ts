import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileAppDefinition } from '../entities/app-definition.entity';
import {
  CreateDefinitionDto,
  UpdateDefinitionDto,
} from '../dto/app-definition.dto';
import { DashboardModuleService } from './dashboard-module.service';

@Injectable()
export class MobileAppDefinitionService {
  constructor(
    @InjectRepository(MobileAppDefinition)
    private readonly mobileAppDefinitionRepository: Repository<MobileAppDefinition>,
    private readonly dashboardModuleService: DashboardModuleService,
  ) {}

  async create(
    createDefinitionDto: CreateDefinitionDto,
    createdBy: string,
  ): Promise<MobileAppDefinition> {
    // Validate that the module exists
    const moduleExists = await this.dashboardModuleService.validateModuleExists(
      createDefinitionDto.appModule,
    );
    if (!moduleExists) {
      throw new Error(`Module ${createDefinitionDto.appModule} does not exist`);
    }

    const definition = this.mobileAppDefinitionRepository.create({
      id: `def_${Date.now()}`,
      ...createDefinitionDto,
      createdBy,
    });

    return this.mobileAppDefinitionRepository.save(definition);
  }

  async findAll(): Promise<MobileAppDefinition[]> {
    return this.mobileAppDefinitionRepository.find({
      relations: ['builds'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<MobileAppDefinition | null> {
    return this.mobileAppDefinitionRepository.findOne({
      where: { id },
      relations: ['builds'],
    });
  }

  async update(
    id: string,
    updateDefinitionDto: UpdateDefinitionDto,
  ): Promise<MobileAppDefinition> {
    // If updating module, validate it exists
    if (updateDefinitionDto.appModule) {
      const moduleExists =
        await this.dashboardModuleService.validateModuleExists(
          updateDefinitionDto.appModule,
        );
      if (!moduleExists) {
        throw new Error(
          `Module ${updateDefinitionDto.appModule} does not exist`,
        );
      }
    }

    await this.mobileAppDefinitionRepository.update(id, updateDefinitionDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.mobileAppDefinitionRepository.delete(id);
  }
}
