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

    // Remove '_authenticated' from path segments
    const filteredSegments = pathSegments.filter(
      (segment) => segment !== '_authenticated',
    );

    // Prevent leaking layout prefixes like "settings" into other sections
    let normalizedSegments = [...filteredSegments];
    if (normalizedSegments[0] === 'settings' && normalizedSegments.length > 1) {
      const allowedSettingsChildren = ['profile', 'account'];
      if (
        normalizedSegments[1] &&
        !allowedSettingsChildren.includes(normalizedSegments[1])
      ) {
        normalizedSegments = normalizedSegments.slice(1);
      }
    }

    const breadcrumbs: Array<{
      label: string;
      href: string;
      isCurrentPage: boolean;
    }> = [];

    if (normalizedSegments.length === 0) {
      return breadcrumbs;
    }

    const first: string = normalizedSegments[0] || '';
    const second: string = normalizedSegments[1] || '';

    // Dashboard and subpages
    if (first === 'dashboard') {
      breadcrumbs.push({
        label: '儀表板',
        href: '/dashboard',
        isCurrentPage: normalizedSegments.length === 1,
      });

      if (second === 'profile') {
        breadcrumbs.push({
          label: '個人資料',
          href: '/dashboard/profile',
          isCurrentPage: true,
        });
      }
    }

    // Settings
    else if (first === 'settings') {
      breadcrumbs.push({
        label: '設定',
        href: '/settings',
        isCurrentPage: normalizedSegments.length === 1,
      });

      if (second === 'profile') {
        breadcrumbs.push({
          label: '個人資料',
          href: '/settings/profile',
          isCurrentPage: true,
        });
      } else if (second === 'account') {
        breadcrumbs.push({
          label: '帳戶設定',
          href: '/settings/account',
          isCurrentPage: true,
        });
      }
    }

    // Users
    else if (first === 'users') {
      breadcrumbs.push({
        label: '用戶管理',
        href: '/users',
        isCurrentPage: normalizedSegments.length === 1,
      });

      if (second === 'create') {
        breadcrumbs.push({
          label: '新增用戶',
          href: '/users/create',
          isCurrentPage: true,
        });
      }
    }

    // Fallback: show first segment as current page
    else {
      const firstSegment =
        (first || '').charAt(0).toUpperCase() + (first || '').slice(1);
      breadcrumbs.push({
        label: firstSegment,
        href: location.pathname,
        isCurrentPage: true,
      });
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
