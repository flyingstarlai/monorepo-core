import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDeleteUser, useToggleUserStatus } from '../hooks/use-users';
import { DeleteUserDialog } from './delete-user-dialog';
import type { User } from '../types/user.types';

interface UserTableActionsProps {
  onRefresh?: () => void;
}

export function useUserTableActions({ onRefresh }: UserTableActionsProps = {}) {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{
    user: User | null;
    isOpen: boolean;
  }>({
    user: null,
    isOpen: false,
  });

  const deleteUserMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();

  const handleView = (user: User) => {
    navigate({ to: '/users/$id', params: { id: user.id } });
  };

  const handleEdit = (user: User) => {
    navigate({ to: '/users/$id/edit', params: { id: user.id } });
  };

  const handleDelete = (user: User) => {
    setDeleteDialog({ user, isOpen: true });
  };

  const handleToggleStatus = async (user: User, isActive: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id: user.id,
        isActive,
      });
      onRefresh?.();
    } catch (error) {
      console.error('Toggle user status failed:', error);
    }
  };

  const confirmDelete = async (user: User) => {
    try {
      console.log('Attempting to delete user:', user.id);
      await deleteUserMutation.mutateAsync(user.id);
      console.log('Delete successful, closing dialog');
      setDeleteDialog({ user: null, isOpen: false });
      // No need to call onRefresh since useDeleteUser already invalidates queries
    } catch (error) {
      console.error('Delete user failed:', error);
    }
  };

  const DeleteDialog = () => (
    <DeleteUserDialog
      user={deleteDialog.user}
      isOpen={deleteDialog.isOpen}
      onClose={() => setDeleteDialog({ user: null, isOpen: false })}
      onConfirm={confirmDelete}
      isLoading={deleteUserMutation.isPending}
    />
  );

  return {
    handleView,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    DeleteDialog,
    isTogglingStatus: toggleStatusMutation.isPending,
  };
}
