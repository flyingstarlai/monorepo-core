import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router';
import { UserDetail } from '@/features/users/components/user-detail';
import { useUser } from '@/features/users/hooks/use-users';

export const Route = createFileRoute('/_authenticated/users/$id')({
  component: UserDetailRoute,
});

function UserDetailRoute() {
  const router = useRouter();
  const isEditRoute = router.state.location.pathname.endsWith('/edit');
  const { id } = Route.useParams();

  // If we're on the /edit child route, render the child only
  if (isEditRoute) {
    return <Outlet />;
  }

  const { data: user, isLoading, error } = useUser(id);

  if (isLoading) {
    return <div>Loading user details...</div>;
  }

  if (error || !user) {
    return <div>User not found</div>;
  }

  return <UserDetail user={user} isLoading={isLoading} />;
}
