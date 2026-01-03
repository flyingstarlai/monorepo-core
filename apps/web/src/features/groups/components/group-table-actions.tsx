import { useState } from 'react';
import { useDeleteGroup, useUpdateGroup } from '../hooks/use-groups';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Group } from '../types/group.types';

interface GroupTableActionsProps {
  onRefresh?: () => void;
  onEdit?: (group: Group) => void;
}

export function useGroupTableActions({
  onRefresh,
  onEdit,
}: GroupTableActionsProps = {}) {
  const [deleteDialog, setDeleteDialog] = useState<{
    group: Group | null;
    isOpen: boolean;
  }>({
    group: null,
    isOpen: false,
  });

  const deleteGroupMutation = useDeleteGroup();
  const updateGroupMutation = useUpdateGroup();

  const handleEdit = (group: Group) => {
    console.log('Edit group:', group);
    onEdit?.(group);
  };

  const handleDelete = (group: Group) => {
    setDeleteDialog({ group, isOpen: true });
  };

  const confirmDelete = async (group: Group) => {
    try {
      await deleteGroupMutation.mutateAsync(group.id);
      setDeleteDialog({ group: null, isOpen: false });
      onRefresh?.();
    } catch (error) {
      console.error('Delete group failed:', error);
    }
  };

  const DeleteDialog = () => (
    <Dialog
      open={deleteDialog.isOpen}
      onOpenChange={(open) => setDeleteDialog({ group: null, isOpen: open })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>刪除群組</DialogTitle>
          <DialogDescription>
            確定要刪除群組 "{deleteDialog.group?.name}" 嗎？此操作無法復原。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteDialog({ group: null, isOpen: false })}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              deleteDialog.group && confirmDelete(deleteDialog.group)
            }
            disabled={deleteGroupMutation.isPending}
          >
            {deleteGroupMutation.isPending ? '刪除中...' : '刪除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    handleEdit,
    handleDelete,
    DeleteDialog,
    isTogglingStatus: updateGroupMutation.isPending,
  };
}
