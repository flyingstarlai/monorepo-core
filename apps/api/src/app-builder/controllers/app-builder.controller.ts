import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MobileAppDefinitionService } from '../services/app-definition.service';
import { MobileAppBuildService } from '../services/app-build.service';
import { JenkinsService } from '../services/jenkins.service';
import {
  CreateDefinitionDto,
  UpdateDefinitionDto,
  TriggerBuildDto,
} from '../dto/app-definition.dto';
import { MobileAppBuildDto } from '../dto/app-build.dto';
import { PresignedDownloadDto } from '../dto/app-build.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Mobile App Builder')
@Controller('app-builder')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MobileAppBuilderController {
  constructor(
    private readonly mobileAppDefinitionService: MobileAppDefinitionService,
    private readonly mobileAppBuildService: MobileAppBuildService,
    private readonly jenkinsService: JenkinsService,
  ) {}

  @Get('definitions')
  @ApiOperation({ summary: 'Get all mobile app definitions' })
  @ApiResponse({ status: 200, description: 'List of mobile app definitions' })
  async getDefinitions() {
    return this.mobileAppDefinitionService.findAll();
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get mobile app definition by ID' })
  @ApiParam({ name: 'id', description: 'Definition ID' })
  @ApiResponse({ status: 200, description: 'Mobile app definition details' })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  async getDefinition(@Param('id') id: string) {
    const definition = await this.mobileAppDefinitionService.findById(id);
    if (!definition) {
      throw new Error('Definition not found');
    }
    return definition;
  }

  @Post('definitions')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new mobile app definition' })
  @ApiResponse({ status: 201, description: 'Definition created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async createDefinition(
    @Body() createDefinitionDto: CreateDefinitionDto,
    @Request() req: { user: User },
  ) {
    return this.mobileAppDefinitionService.create(
      createDefinitionDto,
      req.user.id,
    );
  }

  @Put('definitions/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update mobile app definition' })
  @ApiParam({ name: 'id', description: 'Definition ID' })
  @ApiResponse({ status: 200, description: 'Definition updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  async updateDefinition(
    @Param('id') id: string,
    @Body() updateDefinitionDto: UpdateDefinitionDto,
  ) {
    return this.mobileAppDefinitionService.update(id, updateDefinitionDto);
  }

  @Delete('definitions/:id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete mobile app definition' })
  @ApiParam({ name: 'id', description: 'Definition ID' })
  @ApiResponse({ status: 204, description: 'Definition deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  async deleteDefinition(@Param('id') id: string) {
    await this.mobileAppDefinitionService.delete(id);
  }

  @Post('definitions/:id/build')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Trigger build for mobile app definition' })
  @ApiParam({ name: 'id', description: 'Definition ID' })
  @ApiResponse({ status: 201, description: 'Build triggered successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  async triggerBuild(
    @Param('id') id: string,
    @Body() triggerDto: TriggerBuildDto,
    @Request() req: { user: User },
  ) {
    const definition = await this.mobileAppDefinitionService.findById(id);
    if (!definition) {
      throw new Error('Definition not found');
    }

    const buildRequest = {
      appDefinitionId: id,
      appName: definition.appName,
      appId: definition.appId,
      appModule: definition.appModule,
      serverIp: definition.serverIp,
      parameters: triggerDto.parameters,
    };

    const result = await this.jenkinsService.queueBuild(buildRequest);

    // Create build record in database
    const buildData = {
      id: `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      appDefinitionId: id,
      status: 'queued' as const,
      jenkinsQueueId: result.queueId,
      startedBy: req.user.id,
    };

    return this.mobileAppBuildService.create(buildData);
  }

  @Get('builds')
  @ApiOperation({ summary: 'Get all builds' })
  @ApiQuery({
    name: 'definitionId',
    required: false,
    description: 'Filter by definition ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiResponse({ status: 200, description: 'List of builds' })
  async getBuilds(
    @Query('definitionId') definitionId?: string,
    @Query('status') status?: string,
  ) {
    if (definitionId) {
      return this.mobileAppBuildService.findByDefinitionId(definitionId);
    }
    if (status) {
      return this.mobileAppBuildService.findByStatus(status);
    }
    return this.mobileAppBuildService.findByDefinitionId(''); // Return all if no filter
  }

  @Get('builds/:id')
  @ApiOperation({ summary: 'Get build by ID' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Build details' })
  @ApiResponse({ status: 404, description: 'Build not found' })
  async getBuild(@Param('id') id: string) {
    const build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }
    return build;
  }

  @Get('builds/:id/status')
  @ApiOperation({ summary: 'Get build status from Jenkins' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Current build status' })
  async getBuildStatus(@Param('id') id: string) {
    const build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    if (!build.jenkinsQueueId) {
      return { status: build.status, message: 'Build not queued with Jenkins' };
    }

    try {
      const jenkinsStatus = await this.jenkinsService.getBuildStatus(
        build.jenkinsQueueId,
      );
      const mappedStatus = this.jenkinsService.mapJenkinsStatusToBuildStatus(
        jenkinsStatus.status,
      );

      // Update build status in database
      await this.mobileAppBuildService.update(id, {
        status: mappedStatus,
        startedAt: jenkinsStatus.timestamp
          ? new Date(jenkinsStatus.timestamp)
          : undefined,
        completedAt: ['completed', 'failed'].includes(mappedStatus)
          ? new Date()
          : undefined,
        errorMessage:
          mappedStatus === 'failed' ? jenkinsStatus.result : undefined,
      });

      return { status: mappedStatus, jenkinsStatus };
    } catch (error) {
      return { status: build.status, message: 'Failed to get Jenkins status' };
    }
  }

  @Get('builds/:id/download')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get presigned download URL for build artifact' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Presigned download URL' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Build not found' })
  async getDownloadUrl(@Param('id') id: string): Promise<PresignedDownloadDto> {
    const build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    if (build.status !== 'completed') {
      throw new Error('Build must be completed to download artifact');
    }

    if (!build.artifactPath) {
      throw new Error('No artifact available for this build');
    }

    // For now, return a mock presigned URL
    // In production, this would integrate with MinIO to generate presigned URLs
    const fileName = build.artifactPath.split('/').pop() || 'app.apk';

    return {
      url: `http://localhost:9000/android-artifacts/${build.appDefinitionId}/${fileName}`,
      fileName,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
    };
  }
}
