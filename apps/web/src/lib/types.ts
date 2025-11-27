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
