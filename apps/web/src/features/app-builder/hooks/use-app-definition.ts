import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  MobileAppDefinition,
  MobileAppBuild,
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
  TriggerBuildRequest,
} from '../../../lib/types';

export function useDefinitions(companyCode?: string) {
  return useQuery({
    queryKey: ['app-builder', 'definitions', companyCode],
    queryFn: async (): Promise<MobileAppDefinition[]> => {
      const params = companyCode
        ? `?companyCode=${encodeURIComponent(companyCode)}`
        : '';
      const response = await api.get<MobileAppDefinition[]>(
        `/app-builder/definitions${params}`,
      );
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useDefinition(id: string) {
  return useQuery({
    queryKey: ['app-builder', 'definitions', id],
    queryFn: async (): Promise<MobileAppDefinition> => {
      const response = await api.get<MobileAppDefinition>(
        `/app-builder/definitions/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateDefinitionRequest,
    ): Promise<MobileAppDefinition> => {
      const response = await api.post<MobileAppDefinition>(
        '/app-builder/definitions',
        data,
      );
      return response.data;
    },
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDefinitionRequest;
    }): Promise<MobileAppDefinition> => {
      const response = await api.put<MobileAppDefinition>(
        `/app-builder/definitions/${id}`,
        data,
      );
      return response.data;
    },
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
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/app-builder/definitions/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'definitions'],
      });
      queryClient.removeQueries({
        queryKey: ['app-builder', 'definitions', id],
      });
    },
  });
}

export function useTriggerBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appDefinitionId,
      data,
    }: {
      appDefinitionId: string;
      data?: TriggerBuildRequest;
    }): Promise<{ buildId: string; status: string }> => {
      const response = await api.post<MobileAppBuild>(
        `/app-builder/definitions/${appDefinitionId}/build`,
        data ?? {},
      );
      const created = response.data;
      return { buildId: created.id, status: created.status };
    },
    onSuccess: (_, { appDefinitionId }) => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'builds', appDefinitionId],
      });
    },
  });
}
