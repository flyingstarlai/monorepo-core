export interface MobileAppDefinition {
  id: string;
  appName: string;
  appId: string;
  appModule: string;
  serverIp: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  parameters?: Record<string, any>;
  isActive: boolean;
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
  errorDetails?: string;
  errorCategory?: string;
  startedBy: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Enhanced fields
  buildParameters?: string;
  durationMs?: number;
  memoryUsageMb?: number;
  cpuUsagePercent?: number;
  buildStage?: string;
  stageProgressPercent?: number;
  performanceMetrics?: string;
  environment?: string;
  branchName?: string;
  commitHash?: string;
  buildType?: 'release' | 'debug' | 'profile';
  isAutomated?: boolean;
  triggerSource?: string;
  buildLogsSummary?: string;
  testResults?: any;
  qualityMetrics?: any;

  // Relations
  appDefinition?: MobileAppDefinition;
}

export interface DashboardModule {
  id: string;
  name: string;
  description?: string;
  buildCount?: number;
}

export interface BuildFilters {
  definitionId?: string;
  statuses?: string[];
  appIds?: string[];
  modules?: string[];
  startedBy?: string;
  buildType?: 'release' | 'debug' | 'profile';
  environment?: string;
  errorCategory?: string;
  isAutomated?: boolean;
  branchName?: string;
  searchQuery?: string;
  buildNumber?: {
    from?: number;
    to?: number;
  };
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  durationRange?: {
    from?: number;
    to?: number;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BuildAnalytics {
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  averageBuildTime: number;
  successRate: number;
  failureRate: number;
  buildsByTimeRange: Array<{
    date: string;
    builds: number;
    successes: number;
    failures: number;
  }>;
  buildsByModule: Array<{
    module: string;
    builds: number;
    successes: number;
    failures: number;
  }>;
  buildsByUser: Array<{
    user: string;
    builds: number;
    successes: number;
    failures: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  performanceMetrics: {
    fastestBuild: {
      id: string;
      duration: number;
      appName: string;
    };
    slowestBuild: {
      id: string;
      duration: number;
      appName: string;
    };
    mostActiveUser: {
      user: string;
      builds: number;
      successes: number;
      failures: number;
    };
    mostBuiltApp: {
      app: string;
      buildCount: number;
    };
  };
}

export interface BuildComparison {
  builds: [MobileAppBuild, MobileAppBuild];
  definitions: [MobileAppDefinition, MobileAppDefinition];
  comparison: {
    timeDifference: number;
    durationDifference: number;
    statusChange: boolean;
    buildNumberDifference: number;
  };
}

export interface BuildWebSocketMessage {
  type: 'buildUpdate' | 'buildStageUpdate' | 'buildCompleted';
  data: MobileAppBuild | { buildId: string; stage: string; progress: number };
}

export interface BuildStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  startTime?: Date;
  endTime?: Date;
  progress?: number;
}

export interface BuildProgress {
  buildId: string;
  currentStage: string;
  overallProgress: number;
  stages: BuildStage[];
  estimatedCompletion?: Date;
}
