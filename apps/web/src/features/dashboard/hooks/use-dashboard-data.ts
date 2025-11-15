import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthIsAuthenticated } from '@/features/auth/store';
import type { DashboardStats, RecentActivity } from '../types/dashboard.types';
import type { QueryRetryError } from '@/lib/types/errors';

export const useDashboardStats = () => {
  const isAuthenticated = useAuthIsAuthenticated();

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refresh every 10 minutes
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: (failureCount, error: QueryRetryError) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

export const useRecentActivity = () => {
  const isAuthenticated = useAuthIsAuthenticated();

  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<RecentActivity[]> => {
      const response = await api.get('/dashboard/activity');
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: (failureCount, error: QueryRetryError) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};
