import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    queryFn: () => mobileAppBuilderService.getAppIds(),
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

export function useBuilds(appDefinitionId?: string) {
  return useQuery({
    queryKey: ['app-builder', 'builds', appDefinitionId],
    queryFn: () => mobileAppBuilderService.getBuilds(appDefinitionId),
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
