import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from '@tanstack/react-router';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    // Wait for global auth initialization promise
    await context.authInit;

    // Check authentication status from router context
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Use hardcoded default destination to avoid location object issues
          redirect: '/dashboard',
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const location = useLocation();
  const isOfficeRoute = /\/documents\/[^/]+\/office/.test(location.pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader key={`dashboard-header-${location.pathname}`} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
