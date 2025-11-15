import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UsersFilters,
  UsersResponse,
  FactoryUser,
  FactoryDepartment,
} from '../types/user.types';

export const useUsers = (filters?: UsersFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async (): Promise<UsersResponse> => {
      const response = await api.get('/users');
      return response.data as UsersResponse;
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
    onSuccess: (updatedUser, variables) => {
      // Update cache directly with fresh data
      queryClient.setQueryData(['user', variables.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Only invalidate list

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
      console.log('User deleted successfully');
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
