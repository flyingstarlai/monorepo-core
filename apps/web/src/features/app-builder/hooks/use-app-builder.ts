import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  MobileAppBuild,
  DashboardModule,
  PresignedDownloadResponse,
  JenkinsConnectionStatus,
  JenkinsQueueInfo,
  BuildStageProgress,
  AppIdDto,
} from '../../../lib/types';

// Re-export from other hook files for backward compatibility
export * from './use-app-definition';
export * from './use-app-company';

export function useModules() {
  return useQuery({
    queryKey: ['app-builder', 'modules'],
    queryFn: async (): Promise<DashboardModule[]> => {
      const response = await api.get<{ value: string; label: string }[]>(
        '/app-builder/modules',
      );
      return (response.data || []).map((m) => ({
        id: m.value,
        name: m.label,
        description: undefined,
        version: '',
        enabled: true,
      }));
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useAppIds() {
  return useQuery({
    queryKey: ['app-builder', 'app-ids'],
    queryFn: async (): Promise<AppIdDto[]> => {
      const response = await api.get<AppIdDto[]>('/app-builder/app-ids');
      const appIds = response.data || [];

      const extractNumber = (appId: string): number => {
        const match = appId.match(/TCS(\d+)/);
        return match && match[1] ? parseInt(match[1], 10) : 0;
      };

      return appIds.sort((a, b) => {
        const numA = extractNumber(a.appId!);
        const numB = extractNumber(b.appId!);
        return numA - numB;
      });
    },
    enabled: true,
  });
}

export function useBuild(id: string) {
  return useQuery({
    queryKey: ['app-builder', 'builds', id],
    queryFn: async (): Promise<MobileAppBuild> => {
      const response = await api.get<MobileAppBuild>(
        `/app-builder/builds/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const build = query.state.data;
      const buildStatus = build?.status;

      if (buildStatus === 'queued' || buildStatus === 'building') {
        return 5000;
      }
      return false;
    },
  });
}

export function useBuilds(
  appDefinitionId?: string,
  filters?: {
    definitionId?: string;
    dateRange?: { from: Date; to: Date };
    statuses: string[];
    appIds: string[];
    modules: string[];
    startedBy?: string;
    buildNumber?: { from?: number; to?: number };
  },
) {
  return useQuery({
    queryKey: ['app-builder', 'builds', appDefinitionId, filters],
    queryFn: async (): Promise<MobileAppBuild[]> => {
      if (!appDefinitionId) return Promise.resolve([]);

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

      const response = await api.get<MobileAppBuild[]>(
        `/app-builder/builds?${params.toString()}`,
      );
      return response.data ?? [];
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

export function useJenkinsStatus() {
  return useQuery({
    queryKey: ['app-builder', 'jenkins', 'status'],
    queryFn: async (): Promise<JenkinsConnectionStatus> => {
      const response = await api.get<JenkinsConnectionStatus>(
        '/app-builder/jenkins/status',
      );
      return response.data;
    },
    staleTime: 1000 * 60,
  });
}

export function useJenkinsQueue() {
  return useQuery({
    queryKey: ['app-builder', 'jenkins', 'queue'],
    queryFn: async (): Promise<JenkinsQueueInfo> => {
      const response = await api.get<JenkinsQueueInfo>(
        '/app-builder/jenkins/queue',
      );
      return response.data;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

export function useBuildStages(
  buildId: string,
  shouldFetch?: boolean | string,
) {
  return useQuery({
    queryKey: ['app-builder', 'builds', buildId, 'stages'],
    queryFn: async (): Promise<BuildStageProgress> => {
      const response = await api.get<BuildStageProgress>(
        `/app-builder/builds/${buildId}/stages`,
      );
      return response.data;
    },
    enabled:
      !!buildId &&
      (shouldFetch === true ||
        (typeof shouldFetch === 'string' &&
          ['queued', 'building', 'failed'].includes(shouldFetch))),
    refetchInterval: 2000,
  });
}

export function useBuildConsole(
  buildId: string,
  shouldFetch?: boolean | string,
) {
  return useQuery({
    queryKey: ['app-builder', 'builds', buildId, 'console'],
    queryFn: async (): Promise<string> => {
      const response = await api.get(`/app-builder/builds/${buildId}/console`, {
        responseType: 'text',
      });
      return response.data ?? '';
    },
    enabled:
      !!buildId &&
      (shouldFetch === true ||
        (typeof shouldFetch === 'string' && shouldFetch === 'failed')),
    refetchInterval: 2000,
  });
}

export function useDownloadArtifact() {
  return useMutation({
    mutationFn: async (buildId: string): Promise<PresignedDownloadResponse> => {
      const response = await api.get<PresignedDownloadResponse>(
        `/app-builder/builds/${buildId}/download`,
      );
      return response.data;
    },
  });
}

export function useGetIdentifiers() {
  return useQuery({
    queryKey: ['app-builder', 'identifiers'],
    queryFn: async (): Promise<AppIdDto[]> => {
      const response = await api.get<AppIdDto[]>(
        '/app-builder/google-services',
      );
      return response.data || [];
    },
  });
}

export function useUploadGoogleServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      content: string;
    }): Promise<{ message: string; count: number }> => {
      const response = await api.post<{ message: string; count: number }>(
        '/app-builder/google-services',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'identifiers'],
      });
    },
  });
}
