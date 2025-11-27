import type {
  MobileAppDefinition,
  MobileAppBuild,
  DashboardModule,
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
  TriggerBuildRequest,
  PresignedDownloadResponse,
  AppIdDto,
} from './types';

// Mock service for development - replace with actual API calls
const mobileAppBuilderService = {
  async getModules(): Promise<DashboardModule[]> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<{ value: string; label: string }[]>(
      '/app-builder/modules',
    );
    // Map API dto -> UI type
    return (res.data || []).map((m) => ({
      id: m.value,
      name: m.label,
      description: undefined,
      version: '',
      enabled: true,
    }));
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

  async getDefinitions(): Promise<MobileAppDefinition[]> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<MobileAppDefinition[]>(
      '/app-builder/definitions',
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

  async getBuilds(appDefinitionId?: string): Promise<MobileAppBuild[]> {
    const { apiClient } = await import('./api-client');
    const res = await apiClient.get<MobileAppBuild[]>('/app-builder/builds', {
      params: appDefinitionId ? { definitionId: appDefinitionId } : undefined,
    });
    return res.data || [];
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
    // Note: API returns { status, jenkinsStatus }. For now, fetch the build entity then overlay status if present.
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
};

export default mobileAppBuilderService;
