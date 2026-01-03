import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  FactoryUser,
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
} from '../types/user.types';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      // Request all users with increased limit for client-side pagination
      const response = await api.get('/users?limit=300');
      // Handle both response formats - direct array or wrapped in users property
      const data = response.data.users || response.data;

      if (!Array.isArray(data)) {
        console.error('Invalid response format: expected array of users', data);
        return [];
      }

      // Filter out null/invalid users and ensure required fields exist
      return data.filter(
        (user) => user != null && user.id != null && user.username != null,
      );
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
    queryKey: ['departments'],
    queryFn: async (): Promise<Department[]> => {
      const response = await api.get('/departments');
      return response.data as Department[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments-all'],
    queryFn: async (): Promise<Department[]> => {
      const response = await api.get('/departments');
      return response.data as Department[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useDepartment = (deptNo: string) => {
  return useQuery({
    queryKey: ['department', deptNo],
    queryFn: async (): Promise<Department> => {
      const response = await api.get(`/departments/${deptNo}`);
      return response.data as Department;
    },
    enabled: !!deptNo,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepartmentData): Promise<Department> => {
      const response = await api.post('/departments', data);
      return response.data as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useUpdateDepartment = (deptNo: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDepartmentData): Promise<Department> => {
      const response = await api.put(`/departments/${deptNo}`, data);
      return response.data as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useToggleDepartmentActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deptNo: string): Promise<Department> => {
      const response = await api.patch(`/departments/${deptNo}/toggle-active`);
      return response.data as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deptNo: string): Promise<void> => {
      await api.delete(`/departments/${deptNo}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};
