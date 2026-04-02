import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
} from '@tanstack/react-router';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasAnyRole(['admin'])) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.pathname + location.search,
          reason: 'insufficient_role',
        },
      });
    }
  },
  component: UsersLayout,
});

function UsersLayout() {
  const { user } = useAuthContext();
  const router = useRouter();

  // Check if we're on main users list page using regex to detect user action routes
  const userActionRoutes = /^\/users\/(create|\d+\/view(\/edit)?)$/;
  const isUsersIndex = !userActionRoutes.test(router.state.location.pathname);

  // Determine create user link based on role
  const getCreateUserLink = () => {
    if (user?.role === 'admin') {
      return '/users/create';
    }
    return undefined;
  };

  return (
    <div className="space-y-6 mx-auto w-full max-w-7xl flex-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">用戶管理</h1>
          <p className="text-slate-600 mt-2">
            管理系統中的用戶帳戶、角色和權限。
          </p>
        </div>
        {isUsersIndex && getCreateUserLink() && (
          <Link to={getCreateUserLink()}>
            <Button className="flex items-center space-x-2">
              <Plus className="mr-2 h-4 w-4" />
              <span>新增用戶</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}
