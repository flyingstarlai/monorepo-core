import { createFileRoute } from '@tanstack/react-router';
import { UserDetail } from '@/features/users/components/user-detail';
import { useUser } from '@/features/users/hooks/use-users';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';

export const Route = createFileRoute('/_authenticated/users/$id/view')({
  component: UserDetailView,
});

function UserDetailView() {
  const { id } = Route.useParams();
  const { data: user, isLoading, error } = useUser(id);

  if (error) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="text-destructive">
          載入用戶詳情時發生錯誤: {error.message}
        </div>
        <Button onClick={() => window.location.reload()}>重新載入</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <LoadingOverlay isLoading={true} message="載入用戶詳情中...">
          <div className="h-32" />
        </LoadingOverlay>
      </div>
    );
  }

  return <UserDetail user={user!} isLoading={isLoading} />;
}
