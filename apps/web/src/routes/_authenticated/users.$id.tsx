import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/users/$id')({
  component: UserIdLayout,
});

function UserIdLayout() {
  // Pure layout route - just renders outlet for child routes
  return <Outlet />;
}
