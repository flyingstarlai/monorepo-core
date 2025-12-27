import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';

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
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mx-auto flex h-full w-full max-w-7xl">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
