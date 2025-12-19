import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JenkinsService } from '../services/jenkins.service';

@ApiTags('Mobile App Builder - Jenkins Status')
@Controller('app-builder/jenkins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JenkinsStatusController {
  constructor(private readonly jenkinsService: JenkinsService) {}

  private checkFeatureFlag() {
    if (process.env.FEATURE_APP_BUILDER !== 'true') {
      throw new ForbiddenException('App Builder feature is disabled');
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Jenkins connection status' })
  async getStatus() {
    this.checkFeatureFlag();
    return this.jenkinsService.getConnectionStatus();
  }

  @Get('queue')
  @ApiOperation({ summary: 'Get Jenkins queue information' })
  async getQueueInfo() {
    this.checkFeatureFlag();
    return this.jenkinsService.getQueueInfo();
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get Jenkins job summaries' })
  async getJobs() {
    this.checkFeatureFlag();
    return this.jenkinsService.getJobSummaries();
  }
}
