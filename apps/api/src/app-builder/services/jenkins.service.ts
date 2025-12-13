import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface JenkinsQueueResponse {
  id: number;
  url: string;
}

export interface JenkinsBuildStatus {
  id: number;
  url: string;
  status: string;
  timestamp: number;
  result?: string;
  displayName?: string;
  fullDisplayName?: string;
  estimatedDuration?: number;
  executable?: {
    number: number;
    url: string;
  };
  actions?: Array<{
    className: string;
    class: string;
    url: string;
  }>;
}

export interface TriggerBuildRequest {
  appDefinitionId: string;
  appName: string;
  appId: string;
  appModule: string;
  serverIp: string;
  parameters?: string;
}

@Injectable()
export class JenkinsService {
  private readonly logger = new Logger(JenkinsService.name);
  private readonly jenkinsClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const jenkinsUrl = this.configService.get<string>('JENKINS_URL');
    const jenkinsUsername = this.configService.get<string>('JENKINS_USERNAME');
    const jenkinsPassword = this.configService.get<string>('JENKINS_PASSWORD');

    if (!jenkinsUrl || !jenkinsUsername || !jenkinsPassword) {
      throw new Error('Jenkins configuration is missing');
    }

    this.jenkinsClient = axios.create({
      baseURL: jenkinsUrl,
      auth: {
        username: jenkinsUsername,
        password: jenkinsPassword,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getCrumb(): Promise<{ crumb: string; crumbRequestField: string }> {
    try {
      const response = await this.jenkinsClient.get('/crumbIssuer/api/json');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Jenkins crumb:', error);
      throw new Error('Failed to authenticate with Jenkins');
    }
  }

  async queueBuild(
    params: TriggerBuildRequest,
  ): Promise<{ queueId: number; buildUrl: string }> {
    try {
      const crumb = await this.getCrumb();

      const jobName = this.configService.get<string>(
        'JENKINS_JOB_NAME',
        'android-app-builder',
      );

      const buildParams = {
        APP_NAME: params.appName,
        APP_MODULE: params.appModule,
        SERVER_IP: params.serverIp,
        // GOOGLE_SERVICES_URL will be handled by Jenkins job from stored content
      };

      const response = await this.jenkinsClient.post(
        `/job/${jobName}/build?delay=0sec`,
        buildParams,
        {
          headers: {
            [crumb.crumbRequestField]: crumb.crumb,
          },
        },
      );

      // Extract queue ID from location header or response
      const queueUrl = response.headers?.location;
      const queueIdMatch = queueUrl?.match(/queue\/item\/(\d+)/);
      const queueId = queueIdMatch ? parseInt(queueIdMatch[1], 10) : 0;

      return {
        queueId,
        buildUrl: `${this.jenkinsClient.defaults.baseURL}/job/${jobName}`,
      };
    } catch (error) {
      this.logger.error('Failed to queue Jenkins build:', error);
      throw new Error('Failed to queue build');
    }
  }

  async getBuildStatus(queueId: number): Promise<JenkinsBuildStatus> {
    try {
      const response = await this.jenkinsClient.get(
        `/queue/item/${queueId}/api/json`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get build status for queue ${queueId}:`,
        error,
      );
      throw new Error('Failed to get build status');
    }
  }

  async getBuildConsole(queueId: number): Promise<string> {
    try {
      // First get the build status to find the actual build number
      const queueStatus = await this.getBuildStatus(queueId);
      const buildNumber = queueStatus.executable?.number;

      if (!buildNumber) {
        throw new Error('Build has not started yet');
      }

      const jobName = this.configService.get<string>(
        'JENKINS_JOB_NAME',
        'android-app-builder',
      );
      const response = await this.jenkinsClient.get(
        `/job/${jobName}/${buildNumber}/consoleText/api/json`,
      );

      return response.data.output || '';
    } catch (error) {
      this.logger.error(
        `Failed to get build console for queue ${queueId}:`,
        error,
      );
      throw new Error('Failed to get build console');
    }
  }

  async getBuildArtifacts(
    queueId: number,
  ): Promise<Array<{ name: string; url: string }>> {
    try {
      const queueStatus = await this.getBuildStatus(queueId);
      const buildNumber = queueStatus.executable?.number;

      if (!buildNumber) {
        return [];
      }

      const jobName = this.configService.get<string>(
        'JENKINS_JOB_NAME',
        'android-app-builder',
      );
      const response = await this.jenkinsClient.get(
        `/job/${jobName}/${buildNumber}/api/json?tree=artifacts[*]`,
      );

      const artifacts = response.data.artifacts || [];
      const baseUrl = `${this.jenkinsClient.defaults.baseURL}/job/${jobName}/${buildNumber}`;

      return artifacts.map((artifact: any) => ({
        name: artifact.fileName,
        url: `${baseUrl}/artifact/${artifact.relativePath}`,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get build artifacts for queue ${queueId}:`,
        error,
      );
      throw new Error('Failed to get build artifacts');
    }
  }

  mapJenkinsStatusToBuildStatus(
    jenkinsStatus: string,
  ): 'queued' | 'building' | 'completed' | 'failed' | 'cancelled' {
    switch (jenkinsStatus?.toLowerCase()) {
      case 'queued':
      case 'pending':
        return 'queued';
      case 'running':
      case 'building':
        return 'building';
      case 'success':
      case 'completed':
        return 'completed';
      case 'failed':
      case 'error':
      case 'aborted':
      case 'cancelled':
        return 'failed';
      default:
        return 'queued';
    }
  }
}
