import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  DocumentStage,
  CreateDocumentStage,
  UpdateDocumentStage,
} from '../types/documents.types';

export const useDocumentStages = () => {
  return useQuery({
    queryKey: ['document-stages'],
    queryFn: async (): Promise<DocumentStage[]> => {
      const response = await api.get<DocumentStage[]>('/document-stages');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateDocumentStage = (options?: {
  onSuccess?: (data: DocumentStage) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentStage): Promise<DocumentStage> => {
      const response = await api.post<DocumentStage>('/document-stages', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-stages'] });
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: options?.onError,
  });
};

export const useUpdateDocumentStage = (options?: {
  onSuccess?: (data: DocumentStage) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateDocumentStage & { id: string }): Promise<DocumentStage> => {
      const response = await api.put<DocumentStage>(
        `/document-stages/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-stages'] });
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: options?.onError,
  });
};

export const useDeleteDocumentStage = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/document-stages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-stages'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: options?.onError,
  });
};
