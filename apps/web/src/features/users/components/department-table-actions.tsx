import { useState } from 'react';
import {
  useDeleteDepartment,
  useToggleDepartmentActive,
} from '../hooks/use-users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Department } from '../types/user.types';

interface DepartmentTableActionsProps {
  onRefresh?: () => void;
  onEdit?: (dept: Department) => void;
}

export function useDepartmentTableActions({
  onRefresh,
  onEdit,
}: DepartmentTableActionsProps = {}) {
  const [deleteDialog, setDeleteDialog] = useState<{
    dept: Department | null;
    isOpen: boolean;
  }>({
    dept: null,
    isOpen: false,
  });

  const deleteDepartmentMutation = useDeleteDepartment();
  const toggleStatusMutation = useToggleDepartmentActive();

  const handleEdit = (dept: Department) => {
    console.log('Edit department:', dept);
    onEdit?.(dept);
  };

  const handleDelete = (dept: Department) => {
    setDeleteDialog({ dept, isOpen: true });
  };

  const handleToggleStatus = async (dept: Department) => {
    try {
      await toggleStatusMutation.mutateAsync(dept.deptNo);
      onRefresh?.();
    } catch (error) {
      console.error('Toggle department status failed:', error);
    }
  };

  const confirmDelete = async (dept: Department) => {
    try {
      await deleteDepartmentMutation.mutateAsync(dept.deptNo);

      setDeleteDialog({ dept: null, isOpen: false });
      onRefresh?.();
    } catch (error) {
      console.error('Delete department failed:', error);
    }
  };

  const DeleteDialog = () => (
    <Dialog
      open={deleteDialog.isOpen}
      onOpenChange={(open) => setDeleteDialog({ dept: null, isOpen: open })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>刪除部門</DialogTitle>
          <DialogDescription>
            確定要刪除部門 "{deleteDialog.dept?.deptNo} -{' '}
            {deleteDialog.dept?.deptName}" 嗎？ 此操作無法復原。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteDialog({ dept: null, isOpen: false })}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              deleteDialog.dept && confirmDelete(deleteDialog.dept)
            }
            disabled={deleteDepartmentMutation.isPending}
          >
            {deleteDepartmentMutation.isPending ? '刪除中...' : '刪除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    handleEdit,
    handleDelete,
    handleToggleStatus,
    DeleteDialog,
    isTogglingStatus: toggleStatusMutation.isPending,
  };
}
