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
  minioBucket?: string;
  gitBranch?: string;
  company?: string;
}

export interface TriggerBuildWithIdRequest extends TriggerBuildRequest {
  buildId: string;
}

export interface JenkinsConnectionStatus {
  connected: boolean;
  authenticated: boolean;
  message?: string;
  serverVersion?: string;
  jobName?: string;
  url?: string;
  fetchedAt: string;
}

export interface JenkinsQueueItemSummary {
  id: number;
  jobName?: string;
  queuedAt?: string;
  url?: string;
  stuck?: boolean;
  why?: string;
}

export interface JenkinsQueueInfo {
  available: boolean;
  totalItems: number;
  fetchedAt: string;
  items: JenkinsQueueItemSummary[];
  message?: string;
}

export interface JenkinsJobSummary {
  name: string;
  url?: string;
  color?: string;
  lastBuild?: {
    number?: number;
    result?: string;
    timestamp?: number;
  };
}

const PIPELINE_STAGE_NAMES = [
  'Clean Workspace',
  'Checkout',
  'Validate Parameters',
  'Setup Environment',
  'Build',
  'Archive Artifacts',
  'Upload to MinIO',
] as const;

export type PipelineStageStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface PipelineStageDetail {
  name: string;
  status: PipelineStageStatus;
  startTimeMillis?: number;
  durationMillis?: number;
  pauseDurationMillis?: number;
}

export interface PipelineStageProgress {
  fetchedAt: string;
  source: 'jenkins' | 'fallback';
  message?: string;
  stages: PipelineStageDetail[];
}

@Injectable()
export class JenkinsService {
  private readonly logger = new Logger(JenkinsService.name);
  private readonly jenkinsClient: AxiosInstance;
  private readonly defaultMinioBucket: string;
  private readonly defaultCompany: string;
  private readonly defaultGitBranch: string;

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

    this.defaultMinioBucket = this.configService.get<string>(
      'MINIO_BUCKET',
      'android-builds',
    );
    this.defaultCompany = this.configService.get<string>(
      'JENKINS_COMPANY',
      'TWSBP',
    );
    this.defaultGitBranch = this.configService.get<string>(
      'JENKINS_GIT_BRANCH',
      'ci',
    );
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
        APP_ID: params.appId,
        APP_MODULE: params.appModule,
        SERVER_IP: params.serverIp,
        MINIO_BUCKET: params.minioBucket ?? this.defaultMinioBucket,
        GIT_BRANCH: params.gitBranch ?? this.defaultGitBranch,
        COMPANY: params.company ?? this.defaultCompany,
        // GOOGLE_SERVICES_URL will be handled by Jenkins job from stored content
      };

      // Jenkins requires form-encoded parameters for buildWithParameters
      const formData = new URLSearchParams();
      Object.entries(buildParams).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await this.jenkinsClient.post(
        `/job/${jobName}/buildWithParameters?delay=0sec`,
        formData,
        {
          headers: {
            [crumb.crumbRequestField]: crumb.crumb,
            'Content-Type': 'application/x-www-form-urlencoded',
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
      throw new Error('Failed to queue Jenkins build');
    }
  }

  async queueBuildWithId(
    params: TriggerBuildWithIdRequest,
  ): Promise<{ queueId: number; buildUrl: string }> {
    try {
      const crumb = await this.getCrumb();

      const jobName = this.configService.get<string>(
        'JENKINS_JOB_NAME',
        'android-app-builder',
      );

      const buildParams = {
        APP_NAME: params.appName,
        APP_ID: params.appId,
        APP_MODULE: params.appModule,
        SERVER_IP: params.serverIp,
        MINIO_BUCKET: params.minioBucket ?? this.defaultMinioBucket,
        GIT_BRANCH: params.gitBranch ?? this.defaultGitBranch,
        COMPANY: params.company ?? this.defaultCompany,
        BUILD_ID: params.buildId, // Pass build ID to Jenkins
        // GOOGLE_SERVICES_URL will be handled by Jenkins job from stored content
      };

      // Jenkins requires form-encoded parameters for buildWithParameters
      const formData = new URLSearchParams();
      Object.entries(buildParams).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await this.jenkinsClient.post(
        `/job/${jobName}/buildWithParameters?delay=0sec`,
        formData,
        {
          headers: {
            [crumb.crumbRequestField]: crumb.crumb,
            'Content-Type': 'application/x-www-form-urlencoded',
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
      this.logger.error('Failed to queue Jenkins build with ID:', error);
      throw new Error('Failed to queue Jenkins build');
    }
  }
  }

  async stopBuild(buildNumber: number): Promise<void> {
    if (typeof buildNumber !== 'number' || Number.isNaN(buildNumber)) {
      throw new Error('Invalid Jenkins build number');
    }

    try {
      const crumb = await this.getCrumb();
      const jobName = this.configService.get<string>(
        'JENKINS_JOB_NAME',
        'android-app-builder',
      );

      await this.jenkinsClient.post(
        `/job/${jobName}/${buildNumber}/stop`,
        null,
        {
          headers: {
            [crumb.crumbRequestField]: crumb.crumb,
          },
        },
      );
    } catch (error) {
      this.logger.warn(`Failed to stop Jenkins build ${buildNumber}:`, error);
      throw new Error('Failed to stop Jenkins build');
    }
  }

  async getBuildStatus(queueId: number): Promise<JenkinsBuildStatus> {
    try {
      const response = await this.jenkinsClient.get(
        `/queue/item/${queueId}/api/json`,
      );
      return response.data || { items: [] };
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
        `/job/${jobName}/${buildNumber}/consoleText`,
        { responseType: 'text' },
      );

      return response.data || '';
    } catch (error) {
      this.logger.error(
        `Failed to get build console for queue ${queueId}:`,
        error,
      );
      throw new Error('Failed to get build console');
    }
  }

  async getBuildLogSnippet(
    queueId: number,
    maxLength = 2000,
  ): Promise<string | undefined> {
    // Deprecated: Use getBuildErrorSnippet instead for better error filtering
    try {
      const fullLog = await this.getBuildConsole(queueId);
      if (!fullLog) {
        return undefined;
      }
      const trimmed = fullLog.trim();
      if (trimmed.length <= maxLength) {
        return trimmed;
      }
      return trimmed.slice(trimmed.length - maxLength).trimStart();
    } catch (error) {
      this.logger.warn(
        `Failed to fetch Jenkins log snippet for queue ${queueId}:`,
        error,
      );
      return undefined;
    }
  }

  async getBuildErrorSnippet(queueId: number): Promise<string | undefined> {
    try {
      const fullLog = await this.getBuildConsole(queueId);
      if (!fullLog) {
        return undefined;
      }

      const lines = fullLog.split('\n');
      if (!lines.length) {
        return undefined;
      }

      const errorLines: string[] = [];
      const stageContext: Array<string | null> = new Array(lines.length).fill(
        null,
      );
      let activeStage: string | null = null;

      const stageStartRegex = /\[Pipeline\].*\(([^)]+)\)/;

      // Error patterns to look for
      const errorPatterns = [
        /ERROR|FATAL|Exception|Error:/,
        /Compilation failed|Build failed|Task failed/,
        /FAILED|FAILURE/,
        /java\.lang\./,
        /react-native|gradle|npm error/,
        /Command failed with exit code/,
        /Unable to|Cannot|Could not/,
        /Finished:\s+FAILURE/, // Jenkins final output
        /Build failed!/, // Declarative pipeline summary
      ];

      const validationPatterns = [
        /ERROR:\s*Invalid/i,
        /ERROR:\s*Missing/i,
        /ERROR:\s*Unsupported/i,
        /ERROR:\s*APP_ID/i,
        /Expected format/i,
        /parameter validation/i,
        /Validate Parameters/i,
      ];

      // Non-error patterns to exclude
      const excludePatterns = [
        /INFO|DEBUG|VERBOSE/,
        /WARNING|WARN/,
        /at org\.gradle\./,
        /at java\.lang\.Thread/,
        /at com\.android\./,
        /Caused by: java\.lang\.reflect/,
      ];

      const appendContextLines = (index: number) => {
        const contextStart = Math.max(0, index - 1);
        const contextEnd = Math.min(lines.length - 1, index + 2);
        for (let j = contextStart; j <= contextEnd; j++) {
          const contextLine = lines[j].trim();
          if (!contextLine) {
            continue;
          }
          const stagePrefix = stageContext[j]
            ? `[Stage: ${stageContext[j]}] `
            : '';
          const labeledLine = `${stagePrefix}${contextLine}`;
          if (!errorLines.includes(labeledLine)) {
            errorLines.push(labeledLine);
          }
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        const stageMatch = rawLine.match(stageStartRegex);
        if (stageMatch && stageMatch[1]) {
          activeStage = stageMatch[1];
        }
        stageContext[i] = activeStage;

        if (!trimmed) {
          continue;
        }

        const hasErrorPattern = errorPatterns.some((pattern) =>
          pattern.test(trimmed),
        );
        const hasValidationPattern = validationPatterns.some((pattern) =>
          pattern.test(trimmed),
        );
        const hasExcludePattern = excludePatterns.some((pattern) =>
          pattern.test(trimmed),
        );

        if ((hasErrorPattern || hasValidationPattern) && !hasExcludePattern) {
          appendContextLines(i);
        }
      }

      if (errorLines.length === 0) {
        // Fallback: look for any lines with common failure indicators
        const fallbackMatches: string[] = [];
        for (let i = 0; i < lines.length; i++) {
          const trimmed = lines[i].trim();
          if (!trimmed) {
            continue;
          }
          if (
            /failed|error|exception|cannot|unable|invalid/i.test(trimmed) &&
            trimmed.length > 10
          ) {
            const stagePrefix = stageContext[i]
              ? `[Stage: ${stageContext[i]}] `
              : '';
            const labeledLine = `${stagePrefix}${trimmed}`;
            fallbackMatches.push(labeledLine);
          }
        }

        if (fallbackMatches.length > 0) {
          return fallbackMatches.slice(-4).join('\n').trim();
        }

        return undefined;
      }

      // Return the last few relevant error lines
      const relevantErrors = errorLines.slice(-8);
      return relevantErrors.join('\n').trim();
    } catch (error) {
      this.logger.warn(
        `Failed to fetch Jenkins error snippet for queue ${queueId}:`,
        error,
      );
      return undefined;
    }
  }

  async getBuildConsoleFull(queueId: number): Promise<string | undefined> {
    try {
      const fullLog = await this.getBuildConsole(queueId);
      return fullLog || undefined;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch Jenkins console for queue ${queueId}:`,
        error,
      );
      return undefined;
    }
  }

  async getBuildConsoleFromUrl(
    buildNumber: number,
  ): Promise<string | undefined> {
    try {
      const jobName = this.configService.get<string>(
        'JENKINS_JOB_NAME',
        'android-app-builder',
      );

      const response = await this.jenkinsClient.get(
        `/job/${jobName}/${buildNumber}/consoleText`,
        { responseType: 'text' },
      );

      return response.data || undefined;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch Jenkins console from URL for build ${buildNumber}:`,
        error,
      );
      return undefined;
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

  async getConnectionStatus(): Promise<JenkinsConnectionStatus> {
    const jobName = this.configService.get<string>(
      'JENKINS_JOB_NAME',
      'android-app-builder',
    );
    const baseStatus: JenkinsConnectionStatus = {
      connected: false,
      authenticated: false,
      jobName,
      url: this.jenkinsClient.defaults.baseURL,
      fetchedAt: new Date().toISOString(),
    };

    try {
      const [serverResponse, identityResponse] = await Promise.all([
        this.jenkinsClient.get('/api/json'),
        this.jenkinsClient.get('/whoAmI/api/json'),
      ]);

      return {
        ...baseStatus,
        connected: true,
        authenticated: Boolean(
          identityResponse.data?.id || identityResponse.data?.name,
        ),
        serverVersion:
          serverResponse.headers?.['x-jenkins'] ??
          serverResponse.data?.jenkins_version ??
          serverResponse.data?.version,
        message: 'Connected to Jenkins',
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.warn('Failed to fetch Jenkins connection status:', error);
      return {
        ...baseStatus,
        message:
          error?.response?.status === 401
            ? 'Authentication failed'
            : error?.message || 'Unable to reach Jenkins',
      };
    }
  }

  async getQueueInfo(): Promise<JenkinsQueueInfo> {
    const fallback: JenkinsQueueInfo = {
      available: false,
      totalItems: 0,
      fetchedAt: new Date().toISOString(),
      items: [],
    };

    try {
      const response = await this.jenkinsClient.get(
        '/queue/api/json?tree=items[id,task[name,url],why,inQueueSince,stuck]',
      );
      const items = (response.data?.items || []).map((item: any) => ({
        id: item.id,
        jobName: item.task?.name,
        url: item.task?.url,
        why: item.why,
        stuck: Boolean(item.stuck),
        queuedAt: item.inQueueSince
          ? new Date(item.inQueueSince).toISOString()
          : undefined,
      }));

      return {
        available: true,
        totalItems: items.length,
        fetchedAt: new Date().toISOString(),
        items,
      };
    } catch (error) {
      this.logger.warn('Failed to fetch Jenkins queue information:', error);
      return {
        ...fallback,
        message: 'Failed to load Jenkins queue information',
      };
    }
  }

  async getJobSummaries(): Promise<JenkinsJobSummary[]> {
    try {
      const response = await this.jenkinsClient.get(
        '/api/json?tree=jobs[name,url,color,lastBuild[number,result,timestamp]]',
      );
      const jobs = response.data?.jobs || [];
      return jobs.map((job: any) => ({
        name: job.name,
        url: job.url,
        color: job.color,
        lastBuild: job.lastBuild
          ? {
              number: job.lastBuild.number,
              result: job.lastBuild.result,
              timestamp: job.lastBuild.timestamp,
            }
          : undefined,
      }));
    } catch (error) {
      this.logger.warn('Failed to load Jenkins jobs:', error);
      return [];
    }
  }

  async getPipelineStageProgress(
    buildNumber?: number,
    buildStatus: string = 'queued',
  ): Promise<PipelineStageProgress> {
    if (!buildNumber) {
      return {
        fetchedAt: new Date().toISOString(),
        source: 'fallback',
        message: 'Build has not started yet; stage progress unavailable.',
        stages: this.buildFallbackStages(buildStatus),
      };
    }

    const jobName = this.configService.get<string>(
      'JENKINS_JOB_NAME',
      'android-app-builder',
    );

    try {
      const response = await this.jenkinsClient.get(
        `/job/${jobName}/${buildNumber}/wfapi/describe`,
      );
      const wfapiStages = response.data?.stages || [];
      const mappedStages = wfapiStages.map((stage: any) => ({
        name: stage.name,
        status: this.mapWfapiStageStatus(stage.status),
        startTimeMillis: stage.startTimeMillis,
        durationMillis: stage.durationMillis,
        pauseDurationMillis: stage.pauseDurationMillis,
      }));

      const orderedStages = PIPELINE_STAGE_NAMES.map((name) => {
        const stage = mappedStages.find((s) => s.name === name);
        return (
          stage || {
            name,
            status: 'pending',
          }
        );
      });

      const normalizedStages = this.normalizeStagesAfterFailure(orderedStages);
      const stageSource = mappedStages.length ? 'jenkins' : 'fallback';

      return {
        fetchedAt: new Date().toISOString(),
        source: stageSource,
        stages: normalizedStages,
        message:
          stageSource === 'fallback'
            ? 'Pipeline stage details unavailable from Jenkins; showing default order.'
            : undefined,
      };
    } catch (error) {
      this.logger.warn('Failed to load Jenkins pipeline stages:', error);
      const fallbackStages = this.normalizeStagesAfterFailure(
        this.buildFallbackStages(buildStatus),
      );
      return {
        fetchedAt: new Date().toISOString(),
        source: 'fallback',
        stages: fallbackStages,
        message: 'Unable to reach Jenkins; showing default stage order.',
      };
    }
  }

  private mapWfapiStageStatus(status?: string): PipelineStageStatus {
    switch ((status || '').toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'completed';
      case 'IN_PROGRESS':
      case 'RUNNING':
      case 'PAUSED_PENDING_INPUT':
        return 'running';
      case 'FAILED':
      case 'ABORTED':
      case 'UNSTABLE':
      case 'CANCELED':
        return 'failed';
      case 'NOT_EXECUTED':
        return 'skipped';
      default:
        return 'pending';
    }
  }

  private buildFallbackStages(buildStatus: string): PipelineStageDetail[] {
    const normalizedStatus = (buildStatus || 'queued').toLowerCase();
    return PIPELINE_STAGE_NAMES.map((name, index) => ({
      name,
      status: this.deriveFallbackStageStatus(normalizedStatus, index),
    }));
  }

  private deriveFallbackStageStatus(
    buildStatus: string,
    index: number,
  ): PipelineStageStatus {
    switch (buildStatus) {
      case 'completed':
        return 'completed';
      case 'failed':
      case 'cancelled':
        if (index < 4) {
          return 'completed';
        }
        return index === 4 ? 'failed' : 'pending';
      case 'building':
        return index === 0 ? 'running' : 'pending';
      case 'queued':
      default:
        return 'pending';
    }
  }

  private normalizeStagesAfterFailure(
    stages: PipelineStageDetail[],
  ): PipelineStageDetail[] {
    if (!stages?.length) {
      return stages;
    }

    const failedIndex = stages.findIndex((stage) => stage.status === 'failed');
    if (failedIndex === -1) {
      return stages;
    }

    return stages.map((stage, index) => {
      if (index <= failedIndex) {
        return stage;
      }

      if (stage.status === 'completed' || stage.status === 'failed') {
        return stage;
      }

      return {
        ...stage,
        status: 'skipped',
      };
    });
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
