import { createFileRoute, redirect } from '@tanstack/react-router';
import { AppLoginHistory } from '@/features/apps/components/app-login-history';

export const Route = createFileRoute('/_authenticated/apps/$id')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasAnyRole(['admin', 'manager'])) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.pathname + location.search,
          reason: 'insufficient_role',
        },
      });
    }
  },
  component: AppLoginHistoryPage,
});

function AppLoginHistoryPage() {
  const { id } = Route.useParams();
  return <AppLoginHistory appId={id} />;
}
