import { Link, useLocation } from '@tanstack/react-router';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';

export function AppSidebar() {
  const { user } = useAuthContext();
  const location = useLocation();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const navigation = [
    {
      title: '儀表板',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: location.pathname === '/dashboard',
    },
    ...(isAdminOrManager
      ? [
          {
            title: '用戶管理',
            url: '/users',
            icon: Users,
            isActive: location.pathname.startsWith('/users'),
          },
        ]
      : []),
    {
      title: '設定',
      url: '/settings/profile',
      icon: Settings,
      isActive: location.pathname.startsWith('/settings'),
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">系統管理平台</span>
                  <span className="truncate text-xs">
                    {import.meta.env.VITE_COMPANY_NAME || 'Comp Inc'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>平台</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title || item.url}>
                  <SidebarMenuButton
                    asChild={!!item.url}
                    isActive={item.isActive}
                  >
                    {item.url ? (
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user ? (
          <NavUser user={user} />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut />
                {logoutMutation.isPending ? '登出中...' : '登出'}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
