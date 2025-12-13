import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileAppBuild } from '../entities/app-build.entity';
import { IdGenerator } from '../../utils/id-generator';

@Injectable()
export class MobileAppBuildService {
  constructor(
    @InjectRepository(MobileAppBuild)
    private readonly mobileAppBuildRepository: Repository<MobileAppBuild>,
  ) {}

  async findByDefinitionId(definitionId: string): Promise<MobileAppBuild[]> {
    return this.mobileAppBuildRepository.find({
      where: { appDefinitionId: definitionId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<MobileAppBuild | null> {
    return this.mobileAppBuildRepository.findOne({
      where: { id },
      relations: ['appDefinition'],
    });
  }

  async create(buildData: Partial<MobileAppBuild>): Promise<MobileAppBuild> {
    const build = this.mobileAppBuildRepository.create({
      id: IdGenerator.generateBuildId(),
      ...buildData,
    });
    return this.mobileAppBuildRepository.save(build);
  }

  async update(
    id: string,
    updateData: Partial<MobileAppBuild>,
  ): Promise<MobileAppBuild> {
    await this.mobileAppBuildRepository.update(id, updateData);
    return this.findById(id);
  }

  async findByStatus(status: string): Promise<MobileAppBuild[]> {
    return this.mobileAppBuildRepository.find({
      where: { status: status as any },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveBuilds(): Promise<MobileAppBuild[]> {
    return this.mobileAppBuildRepository.find({
      where: { status: 'queued' },
      order: { createdAt: 'ASC' },
    });
  }
}
