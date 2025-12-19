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
  ForbiddenException,
  Logger,
  Res,
} from '@nestjs/common';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import { Response } from 'express';
import { MobileAppDefinitionService } from '../services/app-definition.service';
import { MobileAppBuildService } from '../services/app-build.service';
import { JenkinsService } from '../services/jenkins.service';
import {
  CreateDefinitionDto,
  UpdateDefinitionDto,
  TriggerBuildDto,
} from '../dto/app-definition.dto';
import { PresignedDownloadDto } from '../dto/app-build.dto';
import { BuildWebhookDto } from '../dto/build-webhook.dto';
import { IdGenerator } from '../../utils/id-generator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { MinioService } from '../../minio/minio.service';
import { User } from '../../users/entities/user.entity';
import { MobileAppBuild } from '../entities/app-build.entity';

@ApiTags('Mobile App Builder')
@Controller('app-builder')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MobileAppBuilderController {
  private readonly logger = new Logger(MobileAppBuilderController.name);

  constructor(
    private readonly mobileAppDefinitionService: MobileAppDefinitionService,
    private readonly mobileAppBuildService: MobileAppBuildService,
    private readonly jenkinsService: JenkinsService,
    private readonly minioService: MinioService,
  ) {}

  private checkFeatureFlag() {
    if (process.env.FEATURE_APP_BUILDER !== 'true') {
      throw new ForbiddenException('App Builder feature is disabled');
    }
  }

  @Get('definitions')
  @ApiOperation({ summary: 'Get all mobile app definitions' })
  @ApiResponse({ status: 200, description: 'List of mobile app definitions' })
  async getDefinitions() {
    this.checkFeatureFlag();
    return this.mobileAppDefinitionService.findAll();
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get mobile app definition by ID' })
  @ApiParam({ name: 'id', description: 'Definition ID' })
  @ApiResponse({ status: 200, description: 'Mobile app definition details' })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  async getDefinition(@Param('id') id: string) {
    this.checkFeatureFlag();
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
    this.checkFeatureFlag();
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
    this.checkFeatureFlag();
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
    this.checkFeatureFlag();
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
    this.checkFeatureFlag();
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
    const buildId = IdGenerator.generateBuildId();
    const buildData = {
      id: buildId,
      appDefinitionId: id,
      status: 'queued' as const,
      jenkinsQueueId: result.queueId,
      startedBy: req.user.id,
    };

    const build = await this.mobileAppBuildService.create(buildData);

    // Trigger Jenkins build with build ID for webhook callback
    const buildRequest = {
      appDefinitionId: id,
      appName: definition.appName,
      appId: definition.appId,
      appModule: definition.appModule,
      serverIp: definition.serverIp,
      parameters: triggerDto.parameters,
      buildId: buildId, // Pass build ID for webhook
    };

    await this.jenkinsService.queueBuildWithId(buildRequest);

    return build;
  }

  @Get('builds')
  @ApiOperation({ summary: 'Get all builds with advanced filtering' })
  @ApiQuery({
    name: 'definitionId',
    required: false,
    description: 'Filter by definition ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (comma-separated for multiple)',
  })
  @ApiQuery({
    name: 'appIds',
    required: false,
    description: 'Filter by app IDs (comma-separated)',
  })
  @ApiQuery({
    name: 'modules',
    required: false,
    description: 'Filter by modules (comma-separated)',
  })
  @ApiQuery({
    name: 'startedBy',
    required: false,
    description: 'Filter by user who started the build',
  })
  @ApiQuery({
    name: 'buildNumberFrom',
    required: false,
    description: 'Filter builds from build number',
    type: Number,
  })
  @ApiQuery({
    name: 'buildNumberTo',
    required: false,
    description: 'Filter builds to build number',
    type: Number,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Filter builds from date (ISO string)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Filter builds to date (ISO string)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order (asc/desc)',
  })
  @ApiQuery({
    name: 'buildType',
    required: false,
    description: 'Filter by build type (release, debug, profile)',
  })
  @ApiQuery({
    name: 'environment',
    required: false,
    description: 'Filter by environment',
  })
  @ApiQuery({
    name: 'errorCategory',
    required: false,
    description: 'Filter by error category',
  })
  @ApiQuery({
    name: 'isAutomated',
    required: false,
    description: 'Filter by automated builds',
    type: Boolean,
  })
  @ApiQuery({
    name: 'branchName',
    required: false,
    description: 'Filter by branch name',
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    description: 'Search in error messages and build logs',
  })
  @ApiQuery({
    name: 'durationFrom',
    required: false,
    description: 'Filter builds with duration from (ms)',
    type: Number,
  })
  @ApiQuery({
    name: 'durationTo',
    required: false,
    description: 'Filter builds with duration to (ms)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of builds with metadata',
  })
  async getBuilds(
    @Query('definitionId') definitionId?: string,
    @Query('status') status?: string,
    @Query('appIds') appIds?: string,
    @Query('modules') modules?: string,
    @Query('startedBy') startedBy?: string,
    @Query('buildType') buildType?: 'release' | 'debug' | 'profile',
    @Query('environment') environment?: string,
    @Query('errorCategory') errorCategory?: string,
    @Query('isAutomated') isAutomated?: boolean,
    @Query('branchName') branchName?: string,
    @Query('searchQuery') searchQuery?: string,
    @Query('buildNumberFrom') buildNumberFrom?: number,
    @Query('buildNumberTo') buildNumberTo?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('durationFrom') durationFrom?: number,
    @Query('durationTo') durationTo?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    this.checkFeatureFlag();

    const filters = {
      definitionId,
      statuses: status ? status.split(',').map((s) => s.trim()) : undefined,
      appIds: appIds ? appIds.split(',').map((id) => id.trim()) : undefined,
      modules: modules ? modules.split(',').map((m) => m.trim()) : undefined,
      startedBy,
      buildType,
      environment,
      errorCategory,
      isAutomated,
      branchName,
      searchQuery,
      buildNumber:
        buildNumberFrom || buildNumberTo
          ? {
              from: buildNumberFrom,
              to: buildNumberTo,
            }
          : undefined,
      dateRange:
        dateFrom || dateTo
          ? {
              from: dateFrom ? new Date(dateFrom) : undefined,
              to: dateTo ? new Date(dateTo) : undefined,
            }
          : undefined,
      durationRange:
        durationFrom || durationTo
          ? {
              from: durationFrom,
              to: durationTo,
            }
          : undefined,
    };

    const pagination = {
      page: page || 1,
      limit: limit || 50,
      sort: sort || 'createdAt',
      order: order || 'desc',
    };

    return this.mobileAppBuildService.findWithFilters(filters, pagination);
  }

  @Get('builds/:id')
  @ApiOperation({ summary: 'Get build by ID' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Build details' })
  @ApiResponse({ status: 404, description: 'Build not found' })
  async getBuild(@Param('id') id: string) {
    this.checkFeatureFlag();
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
    this.checkFeatureFlag();
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

      let errorSnippet: string | undefined;
      if (mappedStatus === 'failed') {
        errorSnippet = await this.jenkinsService.getBuildConsoleFull(
          build.jenkinsQueueId,
        );
      }

      const updatePayload: any = {
        status: mappedStatus,
        startedAt: jenkinsStatus.timestamp
          ? new Date(jenkinsStatus.timestamp)
          : undefined,
        completedAt: ['completed', 'failed'].includes(mappedStatus)
          ? new Date()
          : undefined,
        errorMessage:
          mappedStatus === 'failed'
            ? errorSnippet || jenkinsStatus.result
            : undefined,
      };

      if (jenkinsStatus.executable?.number) {
        updatePayload.jenkinsBuildNumber = jenkinsStatus.executable.number;
      }

      // Update build status in database
      await this.mobileAppBuildService.update(id, updatePayload);

      return { status: mappedStatus, jenkinsStatus };
    } catch {
      return { status: build.status, message: 'Failed to get Jenkins status' };
    }
  }

  @Get('builds/:id/stages')
  @ApiOperation({ summary: 'Get Jenkins pipeline stage progress for a build' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Pipeline stage progress' })
  async getBuildStages(@Param('id') id: string) {
    this.checkFeatureFlag();
    let build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    if (!build.jenkinsBuildNumber && build.jenkinsQueueId) {
      try {
        const jenkinsStatus = await this.jenkinsService.getBuildStatus(
          build.jenkinsQueueId,
        );
        const mappedStatus = this.jenkinsService.mapJenkinsStatusToBuildStatus(
          jenkinsStatus.status,
        );

        build = await this.mobileAppBuildService.update(id, {
          status: mappedStatus,
          jenkinsBuildNumber: jenkinsStatus.executable?.number,
          startedAt: jenkinsStatus.timestamp
            ? new Date(jenkinsStatus.timestamp)
            : undefined,
          completedAt: ['completed', 'failed'].includes(mappedStatus)
            ? new Date()
            : undefined,
          errorMessage:
            mappedStatus === 'failed' ? jenkinsStatus.result : undefined,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to refresh Jenkins information for build ${id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    const stageProgress = await this.jenkinsService.getPipelineStageProgress(
      build?.jenkinsBuildNumber,
      build?.status,
    );

    const failedStage = stageProgress?.stages?.find(
      (stage) => stage.status === 'failed',
    );

    // Check for build completion (all stages completed successfully)
    const allStagesCompleted =
      stageProgress?.stages?.every(
        (stage) => stage.status === 'completed' || stage.status === 'skipped',
      ) && stageProgress?.stages?.length > 0;

    if (allStagesCompleted && build?.status !== 'completed') {
      const completedAt = new Date();
      const startedAt = build?.startedAt
        ? new Date(build.startedAt)
        : completedAt;
      const durationMs = completedAt.getTime() - startedAt.getTime();

      build = await this.mobileAppBuildService.update(id, {
        status: 'completed',
        completedAt,
        durationMs,
        errorMessage: null,
      });

      this.logger.log(
        `Build ${id} completed successfully after ${durationMs}ms`,
      );
    } else if (failedStage && build?.status !== 'failed') {
      if (build?.jenkinsBuildNumber) {
        try {
          await this.jenkinsService.stopBuild(build.jenkinsBuildNumber);
        } catch (error) {
          this.logger.warn(
            `Failed to stop Jenkins build ${build?.jenkinsBuildNumber}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      let errorSnippet: string | undefined;
      if (build?.jenkinsQueueId) {
        errorSnippet = await this.jenkinsService.getBuildConsoleFull(
          build.jenkinsQueueId,
        );
      }

      build = await this.mobileAppBuildService.update(id, {
        status: 'failed',
        completedAt: new Date(),
        errorMessage:
          errorSnippet ||
          `Stage "${failedStage.name}" failed in Jenkins pipeline.`,
      });
    }

    return stageProgress;
  }

  @Get('builds/:id/console')
  @ApiOperation({ summary: 'Get full Jenkins console output for a build' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiProduces('text/plain')
  @ApiResponse({ status: 200, description: 'Plain text console output' })
  async getBuildConsole(@Param('id') id: string, @Res() res: Response) {
    this.checkFeatureFlag();
    let build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    if (!build.jenkinsBuildNumber && build.jenkinsQueueId) {
      try {
        const jenkinsStatus = await this.jenkinsService.getBuildStatus(
          build.jenkinsQueueId,
        );
        const mappedStatus = this.jenkinsService.mapJenkinsStatusToBuildStatus(
          jenkinsStatus.status,
        );
        build = await this.mobileAppBuildService.update(id, {
          status: mappedStatus,
          jenkinsBuildNumber: jenkinsStatus.executable?.number,
          startedAt: jenkinsStatus.timestamp
            ? new Date(jenkinsStatus.timestamp)
            : undefined,
          completedAt: ['completed', 'failed'].includes(mappedStatus)
            ? new Date()
            : undefined,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to refresh Jenkins information for build ${id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    let consoleText: string | undefined;
    if (build?.jenkinsBuildNumber) {
      consoleText = await this.jenkinsService.getBuildConsoleFromUrl(
        build.jenkinsBuildNumber,
      );
    }

    if (!consoleText && build?.jenkinsQueueId) {
      consoleText = await this.jenkinsService.getBuildConsoleFull(
        build.jenkinsQueueId,
      );
    }

    if (!consoleText) {
      throw new Error('Console log is not available yet');
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(consoleText);
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
    this.checkFeatureFlag();
    const build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    if (build.status !== 'completed') {
      throw new Error('Build must be completed to download artifact');
    }

    if (!build.artifactPath) {
      throw new Error(
        'Artifact not yet available. The build may still be uploading, please try again later.',
      );
    }

    // Generate real MinIO presigned URL for android artifact
    const fileName = build.artifactPath.split('/').pop() || 'app.apk';
    let downloadUrl: string;

    try {
      downloadUrl = await this.minioService.getAndroidArtifactDownloadUrl(
        build.artifactPath,
      );
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }

    return {
      url: downloadUrl,
      fileName,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
    };
  }

  @Get('builds/analytics')
  @ApiOperation({ summary: 'Get build analytics and statistics' })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range in days (7, 30, 90, 180, 365)',
    type: Number,
  })
  @ApiQuery({
    name: 'groupBy',
    required: false,
    description: 'Group results by (day, week, month, module, user, status)',
  })
  @ApiResponse({ status: 200, description: 'Build analytics data' })
  async getBuildAnalytics(
    @Query('timeRange') timeRange?: number,
    @Query('groupBy') groupBy?: string,
  ) {
    this.checkFeatureFlag();

    const analyticsConfig = {
      timeRange: timeRange || 30, // Default to 30 days
      groupBy: groupBy || 'day',
    };

    return this.mobileAppBuildService.getAnalytics(analyticsConfig);
  }

  @Get('builds/compare')
  @ApiOperation({ summary: 'Compare two builds' })
  @ApiQuery({
    name: 'build1Id',
    required: true,
    description: 'First build ID',
  })
  @ApiQuery({
    name: 'build2Id',
    required: true,
    description: 'Second build ID',
  })
  @ApiResponse({ status: 200, description: 'Build comparison data' })
  async compareBuilds(
    @Query('build1Id') build1Id: string,
    @Query('build2Id') build2Id: string,
  ) {
    this.checkFeatureFlag();

    if (!build1Id || !build2Id) {
      throw new Error('Both build1Id and build2Id are required');
    }

    const [build1, build2] = await Promise.all([
      this.mobileAppBuildService.findById(build1Id),
      this.mobileAppBuildService.findById(build2Id),
    ]);

    if (!build1 || !build2) {
      throw new Error('One or both builds not found');
    }

    const [definition1, definition2] = await Promise.all([
      this.mobileAppDefinitionService.findById(build1.appDefinitionId),
      this.mobileAppDefinitionService.findById(build2.appDefinitionId),
    ]);

    return {
      builds: [build1, build2],
      definitions: [definition1, definition2],
      comparison: {
        timeDifference:
          build1.startedAt && build2.startedAt
            ? Math.abs(
                new Date(build2.startedAt).getTime() -
                  new Date(build1.startedAt).getTime(),
              )
            : 0,
        durationDifference: this.calculateDurationDifference(build1, build2),
        statusChange: build1.status !== build2.status,
        buildNumberDifference:
          (build2.jenkinsBuildNumber || 0) - (build1.jenkinsBuildNumber || 0),
      },
    };
  }

  @Get('builds/summary')
  @ApiOperation({ summary: 'Get builds summary statistics' })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range in days',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'Build summary statistics' })
  async getBuildsSummary(@Query('timeRange') timeRange?: number) {
    this.checkFeatureFlag();

    const summaryConfig = {
      timeRange: timeRange || 30,
    };

    return this.mobileAppBuildService.getSummary(summaryConfig);
  }

  private calculateDurationDifference(build1: any, build2: any): number {
    if (
      !build1.startedAt ||
      !build1.completedAt ||
      !build2.startedAt ||
      !build2.completedAt
    ) {
      return 0;
    }

    const duration1 =
      new Date(build1.completedAt).getTime() -
      new Date(build1.startedAt).getTime();
    const duration2 =
      new Date(build2.completedAt).getTime() -
      new Date(build2.startedAt).getTime();

    return duration2 - duration1;
  }

  @Post('builds/:id/webhook')
  @ApiOperation({ summary: 'Webhook endpoint for build status updates' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleBuildWebhook(
    @Param('id') id: string,
    @Body() webhookData: BuildWebhookDto,
  ) {
    this.checkFeatureFlag();

    const build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    // Update build based on webhook data
    const updatePayload: any = {
      status: webhookData.status,
      buildStage: webhookData.stage,
      stageProgressPercent: webhookData.progress,
    };

    // Handle artifact path - only set when build completes successfully
    if (webhookData.status === 'completed' && webhookData.artifactPath) {
      updatePayload.artifactPath = webhookData.artifactPath;
    } else if (
      webhookData.status === 'failed' ||
      webhookData.status === 'cancelled'
    ) {
      // Don't override existing artifactPath on failed builds
      // This protects against Jenkins sending a failure after artifact was already set
    }

    if (webhookData.error) {
      updatePayload.errorMessage = webhookData.error;
      updatePayload.errorCategory = webhookData.errorCategory;
      updatePayload.errorDetails = webhookData.errorDetails;
    }

    if (webhookData.startTime) {
      updatePayload.startedAt = new Date(webhookData.startTime);
    }

    if (webhookData.endTime) {
      updatePayload.completedAt = new Date(webhookData.endTime);
      updatePayload.durationMs = webhookData.endTime - webhookData.startTime;
    }

    if (webhookData.metrics) {
      updatePayload.performanceMetrics = JSON.stringify(webhookData.metrics);
      updatePayload.memoryUsageMb = webhookData.metrics.memoryUsage;
      updatePayload.cpuUsagePercent = webhookData.metrics.cpuUsage;
    }

    const updatedBuild = await this.mobileAppBuildService.update(
      id,
      updatePayload,
    );

    // Emit real-time update
    // Note: WebSocket functionality is handled by BuildWebSocketGateway
    // this.broadcastBuildUpdate(updatedBuild);

    return { success: true, build: updatedBuild };
  }
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BuildWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger(BuildWebSocketGateway.name);

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToBuilds')
  handleSubscribeToBuilds(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId?: string },
  ) {
    client.join('builds');

    if (data.userId) {
      client.join(`builds-user-${data.userId}`);
    }

    this.logger.log(`Client ${client.id} subscribed to build updates`);
    return { status: 'subscribed' };
  }

  @SubscribeMessage('unsubscribeFromBuilds')
  handleUnsubscribeFromBuilds(@ConnectedSocket() client: Socket) {
    client.leave('builds');
    this.logger.log(`Client ${client.id} unsubscribed from build updates`);
    return { status: 'unsubscribed' };
  }

  broadcastBuildUpdate(build: MobileAppBuild) {
    this.server.emit('buildUpdate', build);
    this.server.to(`builds-user-${build.startedBy}`).emit('buildUpdate', build);
  }

  broadcastBuildStageUpdate(buildId: string, stage: string, progress: number) {
    this.server.emit('buildStageUpdate', { buildId, stage, progress });
  }

  broadcastBuildCompleted(build: MobileAppBuild) {
    this.server.emit('buildCompleted', build);
    this.server
      .to(`builds-user-${build.startedBy}`)
      .emit('buildCompleted', build);
  }
}
