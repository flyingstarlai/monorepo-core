import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  Company,
  CreateCompanyData,
  UpdateCompanyData,
} from '../../../lib/types';

export function useCompanies() {
  return useQuery({
    queryKey: ['app-builder', 'companies'],
    queryFn: async (): Promise<Company[]> => {
      const response = await api.get<Company[]>('/app-builder/companies');
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCompany(companyCode: string) {
  return useQuery({
    queryKey: ['app-builder', 'companies', companyCode],
    queryFn: async (): Promise<Company | null> => {
      const response = await api.get<Company[]>('/app-builder/companies');
      const companies = response.data || [];
      return companies.find((c) => c.companyCode === companyCode) || null;
    },
    enabled: !!companyCode,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyData): Promise<Company> => {
      const response = await api.post<Company>('/app-builder/companies', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'companies'],
      });
    },
  });
}

export function useUpdateCompany(companyCode: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCompanyData): Promise<Company> => {
      const response = await api.put<Company>(
        `/app-builder/companies/${companyCode}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'companies'],
      });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyCode: string): Promise<void> => {
      await api.delete(`/app-builder/companies/${companyCode}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'companies'],
      });
    },
  });
}

export function useToggleCompanyActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyCode: string): Promise<Company> => {
      const response = await api.patch<Company>(
        `/app-builder/companies/${companyCode}/toggle-active`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'companies'],
      });
    },
  });
}
