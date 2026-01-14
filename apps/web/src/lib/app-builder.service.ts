import type {
  MobileAppDefinition,
  MobileAppBuild,
  DashboardModule,
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
  TriggerBuildRequest,
  PresignedDownloadResponse,
  AppIdDto,
  JenkinsConnectionStatus,
  JenkinsQueueInfo,
  BuildStageProgress,
  Company,
  CreateCompanyData,
  UpdateCompanyData,
} from './types';

const mobileAppBuilderService = {
  async getModules(): Promise<DashboardModule[]> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<{ value: string; label: string }[]>(
      '/app-builder/modules',
    );
    return (res.data || []).map((m) => ({
      id: m.value,
      name: m.label,
      description: undefined,
      version: '',
      enabled: true,
    }));
  },

  async getCompanies(): Promise<Company[]> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<Company[]>('/app-builder/companies');
    return res.data || [];
  },

  async getAppIds(): Promise<AppIdDto[]> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<AppIdDto[]>('/app-builder/app-ids');
    return res.data || [];
  },

  async getIdentifiers(): Promise<AppIdDto[]> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<AppIdDto[]>('/app-builder/google-services');
    return res.data || [];
  },

  async uploadGoogleServices(data: {
    content: string;
  }): Promise<{ message: string; count: number }> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.post<{ message: string; count: number }>(
      '/app-builder/google-services',
      data,
    );
    return res.data;
  },

  async getDefinitions(companyCode?: string): Promise<MobileAppDefinition[]> {
    const { apiClient } = await import('./api-client');
    const params = companyCode
      ? `?companyCode=${encodeURIComponent(companyCode)}`
      : '';
    const res = await apiClient.get<MobileAppDefinition[]>(
      `/app-builder/definitions${params}`,
    );
    return res.data || [];
  },

  async getDefinition(id: string): Promise<MobileAppDefinition> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<MobileAppDefinition>(
      `/app-builder/definitions/${id}`,
    );
    return res.data;
  },

  async getBuilds(appDefinitionId: string): Promise<MobileAppBuild[]> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<MobileAppBuild[]>(
      `/app-builder/definitions/${appDefinitionId}/builds`,
    );
    return res.data || [];
  },

  async createDefinition(
    data: CreateDefinitionRequest,
  ): Promise<MobileAppDefinition> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.post<MobileAppDefinition>(
      '/app-builder/definitions',
      data,
    );
    return res.data;
  },

  async updateDefinition(
    id: string,
    data: UpdateDefinitionRequest,
  ): Promise<MobileAppDefinition> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.put<MobileAppDefinition>(
      `/app-builder/definitions/${id}`,
      data,
    );
    return res.data;
  },

  async deleteDefinition(id: string): Promise<void> {
    const { apiClient } = await import('./api-client');
    await apiClient.delete(`/app-builder/definitions/${id}`);
  },

  async getBuild(id: string): Promise<MobileAppBuild> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<MobileAppBuild>(
      `/app-builder/builds/${id}`,
    );
    return res.data;
  },

  async getBuildStatus(id: string): Promise<MobileAppBuild> {
    const { apiClient } = await import('./api-client');
    const [buildRes, statusRes] = await Promise.all([
      apiClient.get<MobileAppBuild>(`/app-builder/builds/${id}`),
      apiClient.get<{ status: string }>(`/app-builder/builds/${id}/status`),
    ]);
    const build = buildRes.data;
    return { ...build, status: statusRes.data?.status as any };
  },

  async triggerBuild(
    appDefinitionId: string,
    data?: TriggerBuildRequest,
  ): Promise<{ buildId: string; status: string }> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.post<MobileAppBuild>(
      `/app-builder/definitions/${appDefinitionId}/build`,
      data ?? {},
    );
    const created = res.data;
    return { buildId: created.id, status: created.status };
  },

  async getPresignedDownloadUrl(
    buildId: string,
  ): Promise<PresignedDownloadResponse> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<PresignedDownloadResponse>(
      `/app-builder/builds/${buildId}/download`,
    );
    return res.data;
  },

  async getJenkinsStatus(): Promise<JenkinsConnectionStatus> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<JenkinsConnectionStatus>(
      '/app-builder/jenkins/status',
    );
    return res.data;
  },

  async getJenkinsQueue(): Promise<JenkinsQueueInfo> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<JenkinsQueueInfo>(
      '/app-builder/jenkins/queue',
    );
    return res.data;
  },

  async getBuildStages(buildId: string): Promise<BuildStageProgress> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<BuildStageProgress>(
      `/app-builder/builds/${buildId}/stages`,
    );
    return res.data;
  },

  async getBuildConsole(buildId: string): Promise<string> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get(`/app-builder/builds/${buildId}/console`, {
      responseType: 'text',
    });
    return res.data ?? '';
  },

  async getBuildsWithFilters(filters?: any, pagination?: any): Promise<any> {
    const { apiClient } = await import('./api-client');
    const params = new URLSearchParams();

    if (filters?.definitionId)
      params.append('definitionId', filters.definitionId);
    if (filters?.statuses?.length)
      params.append('status', filters.statuses.join(','));
    if (filters?.appIds?.length)
      params.append('appIds', filters.appIds.join(','));
    if (filters?.modules?.length)
      params.append('modules', filters.modules.join(','));
    if (filters?.startedBy) params.append('startedBy', filters.startedBy);
    if (filters?.buildNumber?.from)
      params.append('buildNumberFrom', filters.buildNumber.from.toString());
    if (filters?.buildNumber?.to)
      params.append('buildNumberTo', filters.buildNumber.to.toString());
    if (filters?.dateRange?.from)
      params.append('dateFrom', filters.dateRange.from.toISOString());
    if (filters?.dateRange?.to)
      params.append('dateTo', filters.dateRange.to.toISOString());

    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      params.append('sort', pagination.sort);
      params.append('order', pagination.order);
    }

    const res = await apiClient.get(`/app-builder/builds?${params.toString()}`);
    return res.data;
  },

  async getBuildAnalytics(timeRange?: number, groupBy?: string): Promise<any> {
    const { apiClient } = await import('./api-client');
    const params = new URLSearchParams();

    if (timeRange) params.append('timeRange', timeRange.toString());
    if (groupBy) params.append('groupBy', groupBy);

    const res = await apiClient.get(
      `/app-builder/builds/analytics?${params.toString()}`,
    );
    return res.data;
  },

  async compareBuilds(build1Id: string, build2Id: string): Promise<any> {
    const { apiClient } = await import('./api-client');
    const params = new URLSearchParams({
      build1Id,
      build2Id,
    });

    const res = await apiClient.get(
      `/app-builder/builds/compare?${params.toString()}`,
    );
    return res.data;
  },

  async getBuildSummary(timeRange?: number): Promise<any> {
    const { apiClient } = await import('./api-client');
    const params = new URLSearchParams();

    if (timeRange) params.append('timeRange', timeRange.toString());

    const res = await apiClient.get(
      `/app-builder/builds/summary?${params.toString()}`,
    );
    return res.data;
  },

  async createCompany(companyData: CreateCompanyData): Promise<Company> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.post<Company>(
      '/app-builder/companies',
      companyData,
    );
    return res.data;
  },

  async updateCompany(
    companyCode: string,
    data: UpdateCompanyData,
  ): Promise<Company> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.put<Company>(
      `/app-builder/companies/${companyCode}`,
      data,
    );
    return res.data;
  },

  async deleteCompany(companyCode: string): Promise<void> {
    const { apiClient } = await import('./api-client');
    await apiClient.delete(`/app-builder/companies/${companyCode}`);
  },

  async toggleCompanyActive(companyCode: string): Promise<Company> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.patch<Company>(
      `/app-builder/companies/${companyCode}/toggle-active`,
    );
    return res.data;
  },
};

export type {
  MobileAppDefinition,
  MobileAppBuild,
  DashboardModule,
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
  TriggerBuildRequest,
  PresignedDownloadResponse,
  AppIdDto,
  JenkinsConnectionStatus,
  JenkinsQueueInfo,
  BuildStageProgress,
  Company,
  CreateCompanyData,
  UpdateCompanyData,
};

export default mobileAppBuilderService;
