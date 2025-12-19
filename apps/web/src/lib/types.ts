export interface MobileAppDefinition {
  id: string;
  appName: string;
  appId: string;
  appModule: string;
  serverIp: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MobileAppBuild {
  id: string;
  appDefinitionId: string;
  status: 'queued' | 'building' | 'completed' | 'failed' | 'cancelled';
  jenkinsQueueId?: number;
  jenkinsBuildNumber?: number;
  artifactPath?: string;
  consoleUrl?: string;
  errorMessage?: string;
  startedBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  buildType?: 'release' | 'debug' | 'profile';
  buildParameters?: string;
  performanceMetrics?: string;
  stagesSnapshot?: any;
  stageSnapshotFetchedAt?: string;
}

export interface DashboardModule {
  id: string;
  name: string;
  description?: string;
  version: string;
  enabled: boolean;
}

export interface CreateDefinitionRequest {
  appName: string;
  appId: string;
  appModule: string;
  serverIp: string;
}

export interface UpdateDefinitionRequest {
  appName?: string;
  appId?: string;
  appModule?: string;
  serverIp?: string;
}

export interface TriggerBuildRequest {
  version?: string;
  buildNumber?: number;
}

export interface PresignedDownloadResponse {
  url: string;
  fileName: string;
  expiresAt: string;
}

export interface AppIdDto {
  appId: string;
  packageName: string;
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

export interface JenkinsQueueItem {
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
  items: JenkinsQueueItem[];
  message?: string;
}

export type PipelineStageStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface BuildStageDetail {
  name: string;
  status: PipelineStageStatus;
  startTimeMillis?: number;
  durationMillis?: number;
  pauseDurationMillis?: number;
}

export interface BuildStageProgress {
  fetchedAt: string;
  source: 'jenkins' | 'fallback';
  message?: string;
  stages: BuildStageDetail[];
}
