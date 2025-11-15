import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { RoleService } from '@/lib/role.service';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useLocation, Link } from '@tanstack/react-router';

export function DashboardHeader() {
  const { user } = useAuthContext();
  const location = useLocation();

  // Generate breadcrumbs based on current location
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Remove '_authenticated' from path segments
    const filteredSegments = pathSegments.filter(
      (segment) => segment !== '_authenticated',
    );

    // Home breadcrumb
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
      isCurrentPage:
        filteredSegments.length === 1 && filteredSegments[0] === 'dashboard',
    });

    // Add other segments
    if (filteredSegments.length > 1) {
      if (
        filteredSegments[0] === 'dashboard' &&
        filteredSegments[1] === 'profile'
      ) {
        breadcrumbs.push({
          label: 'Profile',
          href: '/dashboard/profile',
          isCurrentPage: true,
        });
      } else if (filteredSegments[0] === 'users') {
        breadcrumbs.push({
          label: 'User Management',
          href: '/users',
          isCurrentPage: filteredSegments.length === 1,
        });

        if (filteredSegments.length > 1) {
          if (filteredSegments[1] === 'create') {
            breadcrumbs.push({
              label: 'Create User',
              href: '/users/create',
              isCurrentPage: true,
            });
          } else if (filteredSegments[1] === '$id') {
            breadcrumbs.push({
              label: 'User Details',
              href: location.pathname,
              isCurrentPage: true,
            });
          } else if (
            filteredSegments[1] === '$id' &&
            filteredSegments[2] === 'edit'
          ) {
            breadcrumbs.push({
              label: 'Edit User',
              href: location.pathname,
              isCurrentPage: true,
            });
          }
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-1">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isCurrentPage ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <Link to={crumb.href}>
                      <BreadcrumbLink asChild>
                        <span>{crumb.label}</span>
                      </BreadcrumbLink>
                    </Link>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-2 px-4">
        {/* User Info */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {user?.fullName || user?.username}
            </p>
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: user?.isActive
                  ? RoleService.getRoleColor(user?.role)
                  : undefined,
                color: user?.isActive ? 'white' : undefined,
                borderColor: user?.isActive
                  ? RoleService.getRoleColor(user?.role)
                  : undefined,
              }}
            >
              {user?.role || 'Unknown'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
