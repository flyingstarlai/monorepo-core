import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { UserGroupResponseDto } from '../dto/user-group-response.dto';

export const useUserGroups = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-groups', userId],
    queryFn: async (): Promise<UserGroupResponseDto[]> => {
      const response = await api.get<UserGroupResponseDto[]>(
        `/users/${userId}/groups`,
      );
      return response.data ?? [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
