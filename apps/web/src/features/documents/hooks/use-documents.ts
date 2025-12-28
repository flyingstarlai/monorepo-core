import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  DocumentResponseDto,
  OnlyofficeConfigDto,
  ConversionStatus,
} from '../types/documents.types';

export const useDocuments = (query?: any) => {
  return useQuery({
    queryKey: ['documents', query],
    queryFn: async (): Promise<DocumentResponseDto[]> => {
      const params = new URLSearchParams();
      if (query?.documentKind)
        params.append('documentKind', query.documentKind);
      if (query?.search) params.append('search', query.search);

      const response = await api.get<DocumentResponseDto[]>('/documents', {
        params,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async (): Promise<DocumentResponseDto | undefined> => {
      const response = await api.get<DocumentResponseDto>(`/documents/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateDocument = (options?: {
  onSuccess?: (data: DocumentResponseDto, variables: unknown) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('documentKind', data.documentKind);
      formData.append('documentNumber', data.documentNumber);
      formData.append('documentName', data.documentName);
      formData.append('version', data.version);
      if (data.documentAccessLevel !== undefined) {
        formData.append(
          'documentAccessLevel',
          data.documentAccessLevel.toString(),
        );
      }
      if (data.officeFile) {
        formData.append('files', data.officeFile);
      }
      if (data.pdfFile) {
        formData.append('files', data.pdfFile);
      }

      const response = await api.post<DocumentResponseDto>(
        '/documents',
        formData,
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: options?.onError,
  });
};

export const useUpdateDocument = (options?: {
  onSuccess?: (data: DocumentResponseDto, variables: any) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      if (data.documentKind !== undefined) {
        formData.append('documentKind', data.documentKind);
      }
      if (data.documentNumber !== undefined) {
        formData.append('documentNumber', data.documentNumber);
      }
      if (data.documentName !== undefined) {
        formData.append('documentName', data.documentName);
      }
      if (data.version !== undefined) {
        formData.append('version', data.version);
      }
      if (data.documentAccessLevel !== undefined) {
        formData.append(
          'documentAccessLevel',
          data.documentAccessLevel.toString(),
        );
      }
      if (data.officeFile !== undefined) {
        formData.append('files', data.officeFile);
      }
      if (data.pdfFile !== undefined) {
        formData.append('files', data.pdfFile);
      }

      const response = await api.post<DocumentResponseDto>(
        `/documents/${data.id}`,
        formData,
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: options?.onError,
  });
};

export const useDeleteDocument = (options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete<void>(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: options?.onError,
  });
};

export const useDownloadDocument = (options?: {
  onSuccess?: (blob: Blob) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      type,
    }: {
      id: string;
      type: 'office' | 'pdf';
    }) => {
      const response = await api.get<Blob>(`/documents/${id}/download`, {
        params: { type },
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (blob) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (options?.onSuccess) {
        options.onSuccess(blob);
      }
    },
    onError: options?.onError,
  });
};

export const useDocumentOfficeConfig = (id: string) => {
  return useQuery({
    queryKey: ['document-office-config', id],
    queryFn: async (): Promise<OnlyofficeConfigDto> => {
      const response = await api.get<OnlyofficeConfigDto>(
        `/documents/${id}/office`,
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInitiatePdfConversion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await api.post<{ jobId: string }>(
        `/documents/${documentId}/convert-pdf`,
      );
      return response.data.jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useConversionStatus = (documentId: string, jobId: string) => {
  return useQuery<ConversionStatus>({
    queryKey: ['pdf-conversion-status', documentId, jobId],
    queryFn: async (): Promise<ConversionStatus> => {
      const response = await api.get<ConversionStatus>(
        `/documents/${documentId}/convert-status/${jobId}`,
      );
      return response.data;
    },
    enabled: !!jobId,
    refetchInterval: (data: any) => {
      const shouldPoll =
        data?.status === 'pending' || data?.status === 'processing';
      return shouldPoll ? 2000 : false;
    },
    staleTime: 0,
  });
};

export const useDownloadConvertedPdf = (options?: {
  onSuccess?: (blob: Blob) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string): Promise<Blob> => {
      const response = await api.get<Blob>(
        `/documents/${documentId}/download-pdf`,
        {
          responseType: 'blob',
          // accept both 200 (PDF ready) and 202 (conversion in progress)
          validateStatus: (status) => status === 200 || status === 202,
        },
      );

      const contentType = response.headers['content-type'] || '';

      // If conversion is still in progress, backend returns 202 + JSON { jobId }
      if (response.status === 202 || !contentType.includes('application/pdf')) {
        let jobId: string | undefined;
        try {
          const text = await (response.data as Blob).text();
          const json = JSON.parse(text);
          jobId = json?.jobId;
        } catch {
          // ignore parse errors, we'll still throw a generic error
        }

        const error: any = new Error('Conversion in progress');
        if (jobId) {
          error.jobId = jobId;
        }
        throw error;
      }

      return response.data;
    },
    onSuccess: (blob) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (options?.onSuccess) {
        options.onSuccess(blob);
      }
    },
    onError: options?.onError,
  });
};
