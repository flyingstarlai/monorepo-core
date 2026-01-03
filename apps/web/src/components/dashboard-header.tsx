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
    const third: string = normalizedSegments[2] || '';

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

    // Users Groups
    else if (first === 'users' && second === 'groups') {
      breadcrumbs.push({
        label: '用戶管理',
        href: '/users',
        isCurrentPage: false,
      });
      breadcrumbs.push({
        label: '用戶群組',
        href: '/users/groups',
        isCurrentPage: true,
      });
    }

    // App Builder
    else if (first === 'app-builder') {
      breadcrumbs.push({
        label: 'App Builder',
        href: '/app-builder',
        isCurrentPage: normalizedSegments.length === 1,
      });

      if (second === 'create') {
        breadcrumbs.push({
          label: 'Create Definition',
          href: '/app-builder/create',
          isCurrentPage: true,
        });
      } else if (second === 'identifier') {
        breadcrumbs.push({
          label: 'Identifiers',
          href: '/app-builder/identifier',
          isCurrentPage: true,
        });
      } else if (second && third === 'build') {
        breadcrumbs.push({
          label: 'Build',
          href: location.pathname,
          isCurrentPage: true,
        });
      } else if (second && third === 'history') {
        breadcrumbs.push({
          label: 'History',
          href: location.pathname,
          isCurrentPage: true,
        });
      }
    }

    // Documents
    else if (first === 'documents') {
      breadcrumbs.push({
        label: '文檔',
        href: '/documents',
        isCurrentPage: normalizedSegments.length === 1,
      });

      if (second === 'create') {
        breadcrumbs.push({
          label: '新增文檔',
          href: '/documents/create',
          isCurrentPage: true,
        });
      } else if (second && third === 'edit') {
        breadcrumbs.push({
          label: '編輯文檔',
          href: location.pathname,
          isCurrentPage: true,
        });
      } else if (second && third === 'office') {
        breadcrumbs.push({
          label: '文檔編輯器',
          href: location.pathname,
          isCurrentPage: true,
        });
      } else if (second) {
        breadcrumbs.push({
          label: '文檔詳情',
          href: location.pathname,
          isCurrentPage: true,
        });
      }
    }

    // Departments
    else if (first === 'departments') {
      breadcrumbs.push({
        label: '部門',
        href: '/departments',
        isCurrentPage: normalizedSegments.length === 1,
      });
    }

    // Groups
    else if (first === 'groups') {
      breadcrumbs.push({
        label: '群組',
        href: '/groups',
        isCurrentPage: normalizedSegments.length === 1,
      });

      if (second) {
        breadcrumbs.push({
          label: '群組成員管理',
          href: location.pathname,
          isCurrentPage: true,
        });
      }
    }

    // Settings
    else if (first === 'settings') {
      breadcrumbs.push({
        label: '設定',
        href: '/settings/profile',
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

    // Apps (mobile apps management)
    else if (first === 'apps') {
      breadcrumbs.push({
        label: '行動應用管理',
        href: '/apps',
        isCurrentPage: true,
      });
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
