import { createFileRoute } from '@tanstack/react-router';
import { UserForm } from '@/features/users/components/user-form';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useUpdateUser, useUser } from '@/features/users/hooks/use-users';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { LoadingOverlay } from '@/components/ui/loading';
import type { UpdateUserData } from '@/features/users/types/user.types';

export const Route = createFileRoute('/_authenticated/users/$id/edit')({
  component: UserEdit,
});

function UserEdit() {
  const { user: currentUser } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = Route.useParams();
  const updateUserMutation = useUpdateUser({
    onSuccess: async (_updatedUser, { id: userId }) => {
      // Prefetch detail data before navigation to ensure fresh content
      await queryClient.prefetchQuery({ queryKey: ['user', userId] });
      // Navigate after successful update and query invalidation
      navigate({
        to: '/users/$id/view',
        params: { id: userId },
        replace: true,
      });
    },
  });

  // Fetch user data for editing
  const { data: user, isLoading, error } = useUser(id);

  const handleSubmit = async (data: UpdateUserData) => {
    try {
      await updateUserMutation.mutateAsync({ id, data });
      // Navigation is now handled by onSuccess callback in the mutation
    } catch (error) {
      console.error('Update user failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <LoadingOverlay isLoading={true} message="Loading user data...">
          <div className="h-32" />
        </LoadingOverlay>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="text-destructive">Failed to load user data</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Back Button */}
      <Link to="/users/$id/view" params={{ id }} replace preload="intent">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回用戶</span>
        </Button>
      </Link>

      {/* User Form */}
      <UserForm
        user={user} // Pass user data for edit mode
        onSubmit={handleSubmit}
        isLoading={updateUserMutation.isPending}
        currentUserRole={currentUser?.role}
        title="編輯用戶"
      />
    </div>
  );
}
