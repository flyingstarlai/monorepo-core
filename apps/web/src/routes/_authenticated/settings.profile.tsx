import { createFileRoute } from '@tanstack/react-router';
import { UserProfileComponent } from '@/features/auth/components/user-profile';

export const Route = createFileRoute(
  '/_authenticated/settings/profile',
)({
  component: DashboardProfileRoute,
});

function DashboardProfileRoute() {
  return <UserProfileComponent />;
}
