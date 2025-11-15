import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';

// Import generated route tree
import { routeTree } from './routeTree.gen';

import './styles.css';
import reportWebVitals from './report-web-vitals.ts';
import { queryClient } from './lib/query-client';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './features/auth/store';
import type { RouterContext as AuthRouterContext } from './routes/__root';
import { RoleService } from './lib/role.service';

// Register router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
  interface RouterContext extends AuthRouterContext {}
}

// Get initial auth state from store
const initialAuth = useAuthStore.getState();
// Kick off a single auth initialization and expose promise to context
const authInit = useAuthStore.getState().initializeAuth();

// Role helper functions
const createAuthHelpers = (user: typeof initialAuth.user) => ({
  hasRole: (role: 'admin' | 'manager' | 'user') =>
    RoleService.hasRole(user?.role, role),
  hasAnyRole: (roles: ('admin' | 'manager' | 'user')[]) =>
    RoleService.hasAnyRole(user?.role, roles),
  hasMinimumRole: (minimumRole: 'admin' | 'manager' | 'user') =>
    RoleService.hasMinimumRole(user?.role, minimumRole),
  getPermissions: () => RoleService.getPermissions(user?.role),
});

// Create router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: {
      user: initialAuth.user,
      isAuthenticated: initialAuth.isAuthenticated,
      isLoading: initialAuth.isLoading,
      isAuthenticating: initialAuth.isAuthenticating,
      ...createAuthHelpers(initialAuth.user),
    },
    authInit,
  },
  defaultPreload: 'intent',
});

// Update router context with auth state
useAuthStore.subscribe((state) => {
  router.update({
    context: {
      ...router.options.context,
      auth: {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        isAuthenticating: state.isAuthenticating,
        ...createAuthHelpers(state.user),
      },
    },
  });
});

// Auth initialization is started above and available as context.authInit

// Wrapper component to provide query context
function AppWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

// Render app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppWithProviders />
    </StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
