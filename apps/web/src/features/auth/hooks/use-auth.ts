import { useRouter } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Using Zustand store actions for auth (router context updates via subscription)
import { api } from '@/lib/api-client';
import type {
  LoginFormData,
  ChangePasswordResponse,
  UpdateProfileResponse,
} from '../types/auth.types';
import type { UpdateUserData } from '@/features/users/types/user.types';
import { useAuthContext } from './use-auth-context';
import { useAuthStore } from '@/features/auth/store';

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const storeLogin = useAuthStore((s) => s.login);

  return useMutation<void, Error, LoginFormData>({
    mutationFn: async (data: LoginFormData) => {
      await storeLogin(data);
    },
    onSuccess: () => {
      // Clear any stale query data
      queryClient.clear();
      // Navigate to intended destination after login
      const intended =
        localStorage.getItem('intended_destination') || '/dashboard';
      localStorage.removeItem('intended_destination');
      router.navigate({ to: intended });
    },
    onError: (error) => {
      // Log error for debugging
      console.error('Login error:', error);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const storeLogout = useAuthStore((s) => s.logout);

  return useMutation<void, Error>({
    mutationFn: async () => {
      await storeLogout();
    },
    onSuccess: () => {
      // Clear all query data
      queryClient.clear();
      router.navigate({ to: '/login' });
    },
  });
};

// Hook to access auth state from both context and store
export const useAuth = () => {
  const router = useRouter();

  // Get state from context (consistent with router guards)
  const { user, isAuthenticated, isLoading, isAuthenticating } =
    useAuthContext();

  // Router context state (for debugging)
  const routerAuth = router.options.context.auth;

  return {
    // Primary state from context
    user,
    isAuthenticated,
    isLoading,
    isAuthenticating,

    // Convenience methods using Zustand store
    login: useAuthStore((state) => state.login),
    logout: useAuthStore((state) => state.logout),
    updateProfile: useAuthStore((state) => state.updateProfile),

    // Router context for debugging/guards
    routerAuth,
  };
};

// Hook to get authentication loading states
export const useAuthLoadingStates = () => {
  const { isLoading, isAuthenticating } = useAuthContext();

  return {
    isLoading,
    isAuthenticating,
    isAnyAuthOperation: isLoading || isAuthenticating,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (
      data: UpdateUserData,
    ): Promise<UpdateProfileResponse> => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Update user data in store immediately
      setUser(updatedUser);

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }): Promise<ChangePasswordResponse> => {
      const response = await api.put('/users/change-password', data);
      return response.data;
    },
  });
};

// Keep useCurrentUser for components that need user data with React Query caching
export const useCurrentUser = () => {
  const { user, isLoading } = useAuthContext();

  return {
    data: user,
    isLoading,
    error: null,
  };
};
