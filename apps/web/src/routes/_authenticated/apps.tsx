import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/apps')({
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
  component: AppsLayout,
});

function AppsLayout() {
  // Parent layout for /apps and its children. Renders child routes via Outlet.
  return <Outlet />;
}
