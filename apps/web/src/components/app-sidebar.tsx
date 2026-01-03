import { Link, useLocation } from '@tanstack/react-router';
import * as React from 'react';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Smartphone,
  Layers,
  UserSquare2,
  Fingerprint,
  ChevronDown,
  UsersRound,
  FileText,
  Building2,
} from 'lucide-react';

export function AppSidebar() {
  const { user } = useAuthContext();
  const location = useLocation();
  const logoutMutation = useLogout();

  const [appBuilderExpanded, setAppBuilderExpanded] = React.useState(
    location.pathname.startsWith('/app-builder'),
  );
  const [userGroupExpanded, setUserGroupExpanded] = React.useState(true);
  const [usersExpanded, setUsersExpanded] = React.useState(
    location.pathname.startsWith('/users'),
  );

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const adminOrManager = isAdmin || isManager;

  const navigation = [
    {
      title: '儀表板',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: location.pathname === '/dashboard',
    },
    ...(adminOrManager
      ? [
          {
            title: '用戶與群組管理',
            icon: Users,
            isActive:
              location.pathname.startsWith('/users') ||
              location.pathname.startsWith('/groups'),
            hasSubmenu: true,
            items: [
              {
                title: '用戶列表',
                url: '/users',
                icon: UsersRound,
                isActive: location.pathname === '/users',
              },
              ...(adminOrManager
                ? [
                    {
                      title: '部門管理',
                      url: '/departments',
                      icon: Building2,
                      isActive: location.pathname === '/departments',
                    },
                  ]
                : []),
              ...(isAdmin
                ? [
                    {
                      title: '群組列表',
                      url: '/groups',
                      icon: UserSquare2,
                      isActive: location.pathname === '/groups',
                    },
                  ]
                : []),
            ],
          },
          {
            title: '行動應用管理',
            url: '/apps',
            icon: Smartphone,
            isActive: location.pathname.startsWith('/apps'),
          },
        ]
      : []),
    ...(import.meta.env.DEV ||
    import.meta.env.VITE_FEATURE_DOC_UPLOAD === 'true'
      ? [
          {
            title: '文檔',
            icon: FileText,
            url: '/documents',
            isActive: location.pathname.startsWith('/documents'),
          },
        ]
      : []),
    ...(adminOrManager && import.meta.env.VITE_FEATURE_APP_BUILDER === 'true'
      ? [
          {
            title: 'App Builder',
            icon: Layers,
            isActive: location.pathname.startsWith('/app-builder'),
            hasSubmenu: true,
            items: [
              {
                title: 'Definitions',
                url: '/app-builder',
                icon: Smartphone,
                isActive: location.pathname === '/app-builder',
              },

              {
                title: 'Identifiers',
                url: '/app-builder/identifier',
                icon: Fingerprint,
                isActive: location.pathname.includes('/identifier'),
              },
              {
                title: 'Settings',
                url: '/app-builder/settings',
                icon: Settings,
                isActive: location.pathname === '/app-builder/settings',
              },
            ],
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
                  <span className="truncate font-semibold">帳戶管理器</span>
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
                <SidebarMenuItem
                  key={item.title || item.url || JSON.stringify(item)}
                >
                  {item.hasSubmenu ? (
                    <>
                      <SidebarMenuButton
                        onClick={() => {
                          if (item.title === 'App Builder') {
                            setAppBuilderExpanded(!appBuilderExpanded);
                          } else if (item.title === '用戶與群組管理') {
                            setUserGroupExpanded(!userGroupExpanded);
                          } else if (item.title === '用戶與群組管理') {
                            setUsersExpanded(!usersExpanded);
                          }
                        }}
                        isActive={item.isActive}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        <ChevronDown
                          className={`ml-auto transition-transform ${
                            (item.title === 'App Builder' &&
                              appBuilderExpanded) ||
                            (item.title === '用戶與群組管理' &&
                              userGroupExpanded)
                              ? 'rotate-180'
                              : ''
                          }`}
                        />
                      </SidebarMenuButton>
                      {((item.title === 'App Builder' && appBuilderExpanded) ||
                        (item.title === '用戶與群組管理' &&
                          (userGroupExpanded || usersExpanded))) && (
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem
                              key={
                                subItem.title ||
                                subItem.url ||
                                JSON.stringify(subItem)
                              }
                            >
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItem.isActive}
                              >
                                <Link to={subItem.url}>
                                  <subItem.icon className="w-4 h-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
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
                  )}
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
