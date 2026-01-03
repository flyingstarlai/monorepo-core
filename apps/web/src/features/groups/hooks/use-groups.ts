import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import type {
  CreateGroupInput,
  Group,
  GroupMember,
  UpdateGroupInput,
} from '../types/group.types';

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async (): Promise<Group[]> => {
      const response = await api.get<Group[]>('/groups');
      return response.data ?? [];
    },
  });
};

export const useGroup = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async (): Promise<Group> => {
      const response = await api.get<Group>(`/groups/${groupId}`);
      return response.data;
    },
    enabled: !!groupId,
  });
};

export const useGroupMembers = (groupId: string | undefined) => {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async (): Promise<GroupMember[]> => {
      const response = await api.get<GroupMember[]>(`/groups/${groupId}/users`);
      return response.data ?? [];
    },
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateGroupInput): Promise<Group> => {
      const response = await api.post<Group>('/groups', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('群組新增成功');
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateGroupInput;
    }): Promise<Group> => {
      const response = await api.put<Group>(`/groups/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.id] });
      toast.success('群組已更新');
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/groups/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.removeQueries({ queryKey: ['group', id] });
      queryClient.removeQueries({ queryKey: ['group-members', id] });
      toast.success('群組已刪除');
    },
  });
};

export const useAddGroupMembers = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]): Promise<GroupMember[]> => {
      const response = await api.post<GroupMember[]>(
        `/groups/${groupId}/users`,
        {
          userIds,
        },
      );
      return response.data ?? [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('已新增群組成員');
    },
  });
};

export const useRemoveGroupMember = (groupId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await api.delete(`/groups/${groupId}/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('已移除群組成員');
    },
  });
};
