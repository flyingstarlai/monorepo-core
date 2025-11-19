import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  FactoryUser,
  FactoryDepartment,
} from '../types/user.types';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      // Request all users with increased limit for client-side pagination
      const response = await api.get('/users?limit=300');
      // Handle both response formats - direct array or wrapped in users property
      return response.data.users || response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async (): Promise<User> => {
      const response = await api.get(`/users/${id}`);
      return response.data as User;
    },
    // Force a refetch when detail page mounts after redirect
    refetchOnMount: 'always',
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData): Promise<User> => {
      const response = await api.post('/users', data);
      return response.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = (options?: {
  onSuccess?: (
    user: User,
    variables: { id: string; data: UpdateUserData },
  ) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserData;
    }): Promise<User> => {
      const response = await api.put(`/users/${id}`, data);
      return response.data as User;
    },
    onSuccess: async (updatedUser, variables) => {
      // If API ever returns empty body, force a refetch; otherwise seed cache for instant UI
      if (updatedUser) {
        queryClient.setQueryData(['user', variables.id], updatedUser);
      }
      // Always ensure detail page has fresh data
      await queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      await queryClient.refetchQueries({
        queryKey: ['user', variables.id],
        type: 'active',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // Call custom success callback if provided
      if (options?.onSuccess) {
        options.onSuccess(updatedUser, variables);
      }
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      // Remove deleted user from cache immediately for better UX
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Also show success message
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }): Promise<User> => {
      const response = await api.patch(`/users/${id}/status`, {
        isActive,
      });
      return response.data as User;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};

export const useFactoryUsers = () => {
  return useQuery({
    queryKey: ['factory-users'],
    queryFn: async (): Promise<FactoryUser[]> => {
      const response = await api.get('/users/factory');
      return response.data as FactoryUser[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useFactoryDepartments = () => {
  return useQuery({
    queryKey: ['factory-departments'],
    queryFn: async (): Promise<FactoryDepartment[]> => {
      const response = await api.get('/users/factory-departments');
      return response.data as FactoryDepartment[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
