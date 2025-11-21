import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';

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
  component: AppsIdLayout,
  validateSearch: (search: Record<string, unknown>) => ({
    appName: search.appName as string | undefined,
  }),
});

function AppsIdLayout() {
  return <Outlet />;
}
