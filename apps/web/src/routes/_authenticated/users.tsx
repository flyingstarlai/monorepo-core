import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
} from '@tanstack/react-router';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/users')({
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
  component: UsersLayout,
});

function UsersLayout() {
  const { user } = useAuthContext();
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if we're on the main users list page
  const isUsersIndex = currentPath === '/users' || currentPath === '/users/';

  // Determine create user link based on role
  const getCreateUserLink = () => {
    if (user?.role === 'admin') {
      return '/users/create';
    } else if (user?.role === 'manager') {
      return '/users/create';
    }
    return undefined;
  };

  return (
    <div className="space-y-6">
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
              <span>建立用戶</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}
