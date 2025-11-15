import { useRouter } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth/store';

/**
 * Hook to access auth state from router context with store fallback
 * Use this in components that need auth state during render
 */
export const useAuthContext = () => {
  const router = useRouter();
  const storeAuth = useAuthStore();

  // Prefer router context (updated via subscription), fallback to store
  const auth = router.options.context?.auth || storeAuth;

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isAuthenticating: auth.isAuthenticating,
    token: auth.token,
    refreshToken: auth.refreshToken,
  };
};

/**
 * Hook to access auth actions from store
 * Use this for mutations (login, logout, etc.)
 */
export const useAuthActions = () => {
  return useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    updateProfile: state.updateProfile,
    setUser: state.setUser,
    setLoading: state.setLoading,
    setAuthenticating: state.setAuthenticating,
    initializeAuth: state.initializeAuth,
    refreshAuthToken: state.refreshAuthToken,
    clearAuth: state.clearAuth,
  }));
};
