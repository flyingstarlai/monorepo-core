import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDeleteUser } from '../hooks/use-users';
import { DeleteUserDialog } from './delete-user-dialog';
import type { User } from '@repo/api';

export function useUserTableActions() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{
    user: User | null;
    isOpen: boolean;
  }>({
    user: null,
    isOpen: false,
  });

  const deleteUserMutation = useDeleteUser();

  const handleView = (user: User) => {
    navigate({ to: '/users/$id/view', params: { id: user.id } });
  };

  const handleEdit = (user: User) => {
    navigate({ to: '/users/$id/edit', params: { id: user.id } });
  };

  const handleDelete = (user: User) => {
    setDeleteDialog({ user, isOpen: true });
  };

  const confirmDelete = async (user: User) => {
    try {
      await deleteUserMutation.mutateAsync(user.id);

      setDeleteDialog({ user: null, isOpen: false });
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
    DeleteDialog,
  };
}
