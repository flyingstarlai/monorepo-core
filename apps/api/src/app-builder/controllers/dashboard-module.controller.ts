import {
  Controller,
  Get,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardModuleService } from '../services/dashboard-module.service';
import { DashboardModuleDto } from '../dto/dashboard-module.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

@ApiTags('Mobile App Builder - Modules')
@Controller('app-builder/modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardModuleController {
  constructor(
    private readonly dashboardModuleService: DashboardModuleService,
  ) {}

  private checkFeatureFlag() {
    if (process.env.FEATURE_APP_BUILDER !== 'true') {
      throw new ForbiddenException('App Builder feature is disabled');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all dashboard modules' })
  @ApiResponse({
    status: 200,
    description: 'List of modules',
    type: [DashboardModuleDto],
  })
  async findAll(): Promise<DashboardModuleDto[]> {
    this.checkFeatureFlag();
    return this.dashboardModuleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  @ApiResponse({
    status: 200,
    description: 'Module details',
    type: DashboardModuleDto,
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async findById(@Param('id') id: string): Promise<DashboardModuleDto> {
    this.checkFeatureFlag();
    const module = await this.dashboardModuleService.findById(id);
    if (!module) {
      throw new Error('Module not found');
    }
    return module;
  }
}
