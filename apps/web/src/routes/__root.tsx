import {
  Outlet,
  createRootRouteWithContext,
  Link,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import type { User } from '@/features/users/types/user.types';
import { Button } from '@/components/ui/button';

export interface RouterContext {
  queryClient: QueryClient;
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthenticating: boolean;
    hasRole: (role: User['role']) => boolean;
    hasAnyRole: (roles: User['role'][]) => boolean;
    hasMinimumRole: (minimumRole: User['role']) => boolean;
  };
  authInit: Promise<void>;
}

const enableDevtools = import.meta.env.VITE_ENABLE_DEVTOOLS !== false;

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      {enableDevtools && (
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="inline-flex items-center">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  ),
});
