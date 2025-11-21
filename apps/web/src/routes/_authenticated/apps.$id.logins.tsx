import { createFileRoute, redirect } from '@tanstack/react-router';
import { AppLoginHistory } from '@/features/apps/components/app-login-history';

export const Route = createFileRoute('/_authenticated/apps/$id/logins')({
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
  validateSearch: (search: Record<string, unknown>) => ({
    appName: search.appName as string | undefined,
    deviceId: search.deviceId as string | undefined,
  }),
});

function AppLoginHistoryPage() {
  const { id } = Route.useParams();
  const { appName, deviceId } = Route.useSearch();
  return <AppLoginHistory appId={id} appName={appName} deviceId={deviceId} />;
}
