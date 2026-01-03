import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { GroupDataTable } from '@/features/groups/components/group-data-table';
import { GroupFormDialog } from '@/features/groups/components/group-form-dialog';
import { useGroupTableActions } from '@/features/groups/components/group-table-actions';
import { createGroupTableColumns } from '@/features/groups/components/group-table-columns';
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
} from '@/features/groups/hooks/use-groups';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Group } from '@/features/groups/types/group.types';

type GroupFormResult = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export const Route = createFileRoute('/_authenticated/groups/')({
  component: GroupsIndex,
});

function GroupsIndex() {
  const { data: groups, isLoading } = useGroups();
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleCreate = async (values: GroupFormResult) => {
    try {
      await createGroupMutation.mutateAsync({
        name: values.name,
        description: values.description,
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Create group failed:', error);
    }
  };

  const handleEdit = async (values: GroupFormResult) => {
    if (!editingGroup) return;
    try {
      await updateGroupMutation.mutateAsync({
        id: editingGroup.id,
        payload: {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        },
      });
      setEditingGroup(null);
    } catch (error) {
      console.error('Update group failed:', error);
    }
  };

  const { handleDelete, DeleteDialog } = useGroupTableActions({
    onEdit: (group) => {
      setEditingGroup(group);
    },
  });

  const columns = createGroupTableColumns({
    onEdit: (group) => {
      setEditingGroup(group);
    },
    onDelete: handleDelete,
  });

  const isSubmitting =
    createGroupMutation.isPending || updateGroupMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">群組管理</h1>
          <p className="text-slate-600 mt-2">
            管理系統中的用戶群組和成員分配。
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新增群組
        </Button>
      </div>

      <GroupDataTable data={groups} isLoading={isLoading} columns={columns} />

      <GroupFormDialog
        mode={editingGroup ? 'edit' : 'create'}
        open={isCreateOpen || !!editingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingGroup(null);
          }
        }}
        onSubmit={editingGroup ? handleEdit : handleCreate}
        isSubmitting={isSubmitting}
        group={editingGroup}
      />

      <DeleteDialog />
    </div>
  );
}
