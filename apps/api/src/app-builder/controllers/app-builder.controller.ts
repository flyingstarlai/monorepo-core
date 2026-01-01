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
  Res,
  HttpStatus,
  HttpCode,
  ForbiddenException,
  Logger,
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

    // Create build record in database first
    const buildId = IdGenerator.generateBuildId();
    const buildData = {
      id: buildId,
      appDefinitionId: id,
      status: 'queued' as const,
      jenkinsQueueId: 0, // Will be updated after Jenkins call
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

    const result = await this.jenkinsService.queueBuildWithId(buildRequest);

    // Update build record with Jenkins queue ID
    await this.mobileAppBuildService.update(buildId, {
      jenkinsQueueId: result.queueId,
    });

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

      // Update build status in database
      const updatePayload: Partial<MobileAppBuild> = {
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

      await this.mobileAppBuildService.update(id, updatePayload);

      return { status: mappedStatus, jenkinsStatus };
    } catch {
      return { status: build.status, message: 'Failed to get Jenkins status' };
    }
  }

  @Get('builds/:id/stages')
  @ApiOperation({ summary: 'Get Jenkins pipeline stage progress' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({ status: 200, description: 'Pipeline stage progress' })
  async getBuildStages(@Param('id') id: string) {
    this.checkFeatureFlag();

    const build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    const buildNumber = build.jenkinsBuildNumber;
    const status = build.status;

    return this.jenkinsService.getPipelineStageProgress(buildNumber, status);
  }

  @Get('builds/:id/console')
  @ApiOperation({ summary: 'Get Jenkins build console output' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({
    status: 200,
    description: 'Build console output (text/plain)',
  })
  async getBuildConsole(@Param('id') id: string, @Res() res: Response) {
    this.checkFeatureFlag();

    const build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Build not found',
      });
    }

    if (!build.jenkinsQueueId) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Build has not been queued with Jenkins yet',
      });
    }

    try {
      const consoleOutput = await this.jenkinsService.getBuildConsoleFull(
        build.jenkinsQueueId,
      );

      if (!consoleOutput) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Console output not available yet',
        });
      }

      res.setHeader('Content-Type', 'text/plain');
      res.send(consoleOutput);
    } catch (error) {
      this.logger.error(`Failed to get console for build ${id}:`, error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to retrieve console output from Jenkins',
      });
    }
  }

  @Get('builds/:id/download')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get presigned download URL for build artifact' })
  @ApiParam({ name: 'id', description: 'Build ID' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL with 1-hour expiry',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Build or artifact not found',
  })
  async getDownloadUrl(@Param('id') id: string) {
    this.checkFeatureFlag();

    const build = await this.mobileAppBuildService.findById(id);
    if (!build) {
      throw new Error('Build not found');
    }

    if (build.status !== 'completed' || !build.artifactPath) {
      return {
        url: null,
        fileName: null,
        expiresAt: null,
        message:
          build.status !== 'completed'
            ? 'Build has not completed yet'
            : 'Artifact not available for this build',
      };
    }

    const presignedUrl = await this.minioService.getAndroidArtifactDownloadUrl(
      build.artifactPath,
    );

    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    const fileName = build.artifactPath.split('/').pop() || 'app-release.apk';

    return {
      url: presignedUrl,
      fileName,
      expiresAt,
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

  private calculateDurationDifference(
    build1: MobileAppBuild,
    build2: MobileAppBuild,
  ): number {
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
    const updatePayload: Partial<MobileAppBuild> = {
      status: webhookData.status as
        | 'queued'
        | 'building'
        | 'completed'
        | 'failed'
        | 'cancelled',
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

  afterInit(): void {
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
    void client.join('builds');

    if (data.userId) {
      void client.join(`builds-user-${data.userId}`);
    }

    this.logger.log(`Client ${client.id} subscribed to build updates`);
    return { status: 'subscribed' };
  }

  @SubscribeMessage('unsubscribeFromBuilds')
  handleUnsubscribeFromBuilds(@ConnectedSocket() client: Socket) {
    void client.leave('builds');
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
