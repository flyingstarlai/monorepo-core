import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { User } from '@repo/api';
import type { CreateUserData, UpdateUserData } from '../types/user.types';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await api.get('/users?limit=300');
      const data = response.data.users || response.data;

      if (!Array.isArray(data)) {
        console.error('Invalid response format: expected array of users', data);
        return [];
      }

      return data.filter(
        (user) => user != null && user.id != null && user.username != null,
      );
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async (): Promise<User> => {
      const response = await api.get(`/users/${id}`);
      return response.data as User;
    },
    refetchOnMount: 'always',
    staleTime: 1000 * 60 * 5,
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
      if (updatedUser) {
        queryClient.setQueryData(['user', variables.id], updatedUser);
      }
      await queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      await queryClient.refetchQueries({
        queryKey: ['user', variables.id],
        type: 'active',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });

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
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
    },
  });
};
