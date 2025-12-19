import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MobileAppBuild } from '../../../lib/types';
import mobileAppBuilderService from '../../../lib/app-builder.service';

export function useModules() {
  return useQuery({
    queryKey: ['app-builder', 'modules'],
    queryFn: () => mobileAppBuilderService.getModules(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useAppIds() {
  return useQuery({
    queryKey: ['app-builder', 'app-ids'],
    queryFn: async () => {
      const appIds = await mobileAppBuilderService.getAppIds();

      // Sort by appId in alphanumeric order (TCS01, TCS02, TCS03, etc.)
      return appIds.sort((a, b) => {
        // Extract numeric part from appId (e.g., TCS01 -> 01)
        const extractNumber = (appId: string): number => {
          const match = appId.match(/TCS(\d+)/);
          return match && match[1] ? parseInt(match[1], 10) : 0;
        };

        const numA = extractNumber(a.appId!);
        const numB = extractNumber(b.appId!);

        return numA - numB;
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDefinitions() {
  return useQuery({
    queryKey: ['app-builder', 'definitions'],
    queryFn: () => mobileAppBuilderService.getDefinitions(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDefinition(id: string) {
  return useQuery({
    queryKey: ['app-builder', 'definitions', id],
    queryFn: () => mobileAppBuilderService.getDefinition(id),
    enabled: !!id,
  });
}

export function useBuilds(appDefinitionId?: string, filters?: any) {
  return useQuery({
    queryKey: ['app-builder', 'builds', appDefinitionId, filters],
    queryFn: () => mobileAppBuilderService.getBuilds(appDefinitionId, filters),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refresh every 30 seconds
  });
}

export function useBuild(id: string) {
  return useQuery({
    queryKey: ['app-builder', 'builds', id],
    queryFn: () => mobileAppBuilderService.getBuild(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const build = query.state.data;
      // Poll more frequently for active builds
      if (build?.status === 'queued' || build?.status === 'building') {
        return 5000; // 5 seconds
      }
      return false; // Don't refetch completed/failed builds
    },
  });
}

export function useCreateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Parameters<typeof mobileAppBuilderService.createDefinition>[0],
    ) => mobileAppBuilderService.createDefinition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'definitions'],
      });
    },
  });
}

export function useUpdateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof mobileAppBuilderService.updateDefinition>[1];
    }) => mobileAppBuilderService.updateDefinition(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'definitions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'definitions', id],
      });
    },
  });
}

export function useDeleteDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mobileAppBuilderService.deleteDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'definitions'],
      });
    },
  });
}

export function useTriggerBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appDefinitionId,
      data,
    }: {
      appDefinitionId: string;
      data?: any;
    }) => mobileAppBuilderService.triggerBuild(appDefinitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'builds'],
      });
    },
  });
}

export function useDownloadArtifact() {
  return useMutation({
    mutationFn: (buildId: string) =>
      mobileAppBuilderService.getPresignedDownloadUrl(buildId),
  });
}

export function useJenkinsStatus() {
  return useQuery({
    queryKey: ['app-builder', 'jenkins', 'status'],
    queryFn: () => mobileAppBuilderService.getJenkinsStatus(),
    refetchInterval: 1000 * 30, // refresh every 30 seconds
  });
}

export function useJenkinsQueue() {
  return useQuery({
    queryKey: ['app-builder', 'jenkins', 'queue'],
    queryFn: () => mobileAppBuilderService.getJenkinsQueue(),
    refetchInterval: 1000 * 15, // refresh every 15 seconds
  });
}

export function useBuildStages(
  buildId?: string,
  buildStatus?: MobileAppBuild['status'],
) {
  return useQuery({
    queryKey: ['app-builder', 'builds', buildId, 'stages'],
    queryFn: () => mobileAppBuilderService.getBuildStages(buildId!),
    enabled: !!buildId,
    refetchInterval: (query) => {
      if (!buildId) {
        return false;
      }
      const stageData = query.state.data;
      const stageFailed = stageData?.stages?.some(
        (stage) => stage.status === 'failed',
      );
      if (stageFailed) {
        return false;
      }
      if (buildStatus && !['queued', 'building'].includes(buildStatus)) {
        return false;
      }
      return 1000 * 5;
    },
  });
}

export function useBuildConsole(buildId?: string, enabled?: boolean) {
  return useQuery({
    queryKey: ['app-builder', 'builds', buildId, 'console'],
    queryFn: () => mobileAppBuilderService.getBuildConsole(buildId!),
    enabled: Boolean(buildId) && Boolean(enabled),
    refetchOnWindowFocus: false,
  });
}

export function useBuildAnalytics(timeRange?: number, groupBy?: string) {
  return useQuery({
    queryKey: ['app-builder', 'builds', 'analytics', timeRange, groupBy],
    queryFn: () =>
      mobileAppBuilderService.getBuildAnalytics?.(timeRange, groupBy),
    enabled: !!mobileAppBuilderService.getBuildAnalytics,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBuildComparison(build1Id: string, build2Id: string) {
  return useQuery({
    queryKey: ['app-builder', 'builds', 'compare', build1Id, build2Id],
    queryFn: () => mobileAppBuilderService.compareBuilds?.(build1Id, build2Id),
    enabled:
      !!build1Id && !!build2Id && !!mobileAppBuilderService.compareBuilds,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBuildSummary(timeRange?: number) {
  return useQuery({
    queryKey: ['app-builder', 'builds', 'summary', timeRange],
    queryFn: () => mobileAppBuilderService.getBuildSummary?.(timeRange),
    enabled: !!mobileAppBuilderService.getBuildSummary,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
