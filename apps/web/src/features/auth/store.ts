import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { api } from '@/lib/api-client';
import { isTokenExpired } from '@/features/auth/utils';
import type { User } from '@/features/users/types/user.types';
import type { LoginFormData } from '@/features/auth/types/auth.types';
import type { UpdateUserData } from '@/features/users/types/user.types';

export interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  token: string | null;
  refreshToken: string | null;

  // Actions
  login: (
    credentials: LoginFormData,
  ) => Promise<{ success: boolean; user?: User }>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateUserData) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthenticating: (authenticating: boolean) => void;
  initializeAuth: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading to check auth on app start
      isAuthenticating: false,
      token: null,
      refreshToken: null,

      // Enhanced login with better error handling
      login: async (credentials: LoginFormData) => {
        set({ isAuthenticating: true, isLoading: true });

        try {
          const response = await api.post('/auth/login', credentials);

          const responseData = response.data as {
            access_token: string;
            refresh_token?: string;
            user: User;
          };
          const { access_token, refresh_token, user } = responseData;

          // Atomic state update - tokens are persisted via Zustand
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isAuthenticating: false,
            token: access_token,
            refreshToken: refresh_token || null,
          });

          // Return success for navigation handling
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false, isAuthenticating: false });

          // Enhanced error handling
          if (error && typeof error === 'object' && 'response' in error) {
            const err = error as any;
            if (err.response?.status === 401) {
              throw new Error('Invalid username or password');
            }
          }

          throw error;
        }
      },

      // Enhanced logout with cleanup
      logout: async () => {
        set({ isLoading: true });

        try {
          // Call logout endpoint if available
          try {
            await api.post('/auth/logout', {});
          } catch (error) {
            // Continue with logout even if API call fails
            console.warn('Logout API call failed:', error);
          }
        } finally {
          // Atomic state update - tokens are cleared via Zustand persist
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isAuthenticating: false,
            token: null,
            refreshToken: null,
          });
        }
      },

      // Enhanced profile update
      updateProfile: async (data: UpdateUserData) => {
        try {
          const response = await api.put('/users/profile', data);
          const updatedUser = response.data as User;

          // Update user in store
          set({
            user: updatedUser,
          });
        } catch (error) {
          throw error;
        }
      },

      // Set user manually
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set authenticating state
      setAuthenticating: (authenticating: boolean) => {
        set({ isAuthenticating: authenticating });
      },

      // Initialize authentication state
      initializeAuth: async () => {
        const { token, refreshToken } = get();

        if (!token) {
          set({ isLoading: false });
          return;
        }

        let validToken = token;

        // Check if token is expired and try to refresh
        if (isTokenExpired(token)) {
          if (refreshToken) {
            try {
              await get().refreshAuthToken();
              validToken = get().token || token;
            } catch (refreshError) {
              console.warn('Token refresh failed:', refreshError);
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                isAuthenticating: false,
                token: null,
                refreshToken: null,
              });
              return;
            }
          } else {
            // No refresh token, clear expired token
            set({ isLoading: false });
            return;
          }
        }

        try {
          // Validate token with API using Authorization header
          const response = await api.get('/auth/profile', {
            headers: {
              Authorization: `Bearer ${validToken}`,
            },
          });
          const user = response.data as User;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isAuthenticating: false,
            token: validToken,
            refreshToken: get().refreshToken,
          });
        } catch (error) {
          console.warn('Token validation failed:', error);

          // Clear invalid tokens
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isAuthenticating: false,
            token: null,
            refreshToken: null,
          });
        }
      },

      // Enhanced token refresh
      refreshAuthToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          set({ isAuthenticating: true });

          const response = await api.post('/auth/refresh', {
            refreshToken,
          });

          const refreshData = response.data as {
            access_token: string;
            refresh_token?: string;
          };
          const { access_token, refresh_token: newRefreshToken } = refreshData;

          // Update tokens - persisted via Zustand
          set((state) => ({
            ...state,
            token: access_token,
            refreshToken: newRefreshToken || refreshToken,
            isAuthenticating: false,
          }));
        } catch (error) {
          set({ isAuthenticating: false });

          // If refresh fails, logout
          if (error && typeof error === 'object' && 'response' in error) {
            const err = error as any;
            if (err.response?.status === 401) {
              await get().logout();
            }
          }

          throw error;
        }
      },

      // Clear authentication state
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isAuthenticating: false,
          token: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

// Enhanced selectors for optimized re-renders
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthIsAuthenticating = () =>
  useAuthStore((state) => state.isAuthenticating);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthRefreshToken = () =>
  useAuthStore((state) => state.refreshToken);

// Action selectors for stable references
export const useAuthActions = () => ({
  login: useAuthStore((state) => state.login),
  logout: useAuthStore((state) => state.logout),
  updateProfile: useAuthStore((state) => state.updateProfile),
  setUser: useAuthStore((state) => state.setUser),
  setLoading: useAuthStore((state) => state.setLoading),
  setAuthenticating: useAuthStore((state) => state.setAuthenticating),
  initializeAuth: useAuthStore((state) => state.initializeAuth),
  refreshAuthToken: useAuthStore((state) => state.refreshAuthToken),
  clearAuth: useAuthStore((state) => state.clearAuth),
});
