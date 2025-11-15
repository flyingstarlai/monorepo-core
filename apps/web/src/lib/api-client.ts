import axios from 'axios';
import { useLoadingBar } from '@/store/loading-bar.ts';
import { useAuthStore } from '@/features/auth/store.ts';
import { isTokenExpired } from '@/features/auth/utils.ts';
import { toast } from 'sonner';

function isLocalAccess(): boolean {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  );
}

function getBaseUrl(): string {
  if (isLocalAccess()) {
    return import.meta.env.VITE_BASE_LOCAL ?? 'http://localhost:3000';
  }
  return import.meta.env.VITE_BASE_PUBLIC ?? 'https://ds.twsbp.net';
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  // start global loading bar for any request
  useLoadingBar.getState().start();

  const { token, clearAuth } = useAuthStore.getState();

  // Check if token is expired before making request
  if (token && isTokenExpired(token)) {
    console.warn('Token expired, clearing auth');
    clearAuth();
    toast.error('登录已过期，请重新登录');

    // Don't redirect if already on login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(new Error('Token expired'));
  }

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login';

      // Only clear auth and redirect if not already on login page
      if (!isLoginPage) {
        console.warn('401 Unauthorized response, clearing auth');
        useAuthStore.getState().clearAuth();
        toast.error('身份验证失效，请重新登录');

        // Add delay to prevent race conditions
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }

    return Promise.reject(err);
  },
);

api.interceptors.response.use(
  (res) => {
    useLoadingBar.getState().done();
    return res;
  },
  (err) => {
    useLoadingBar.getState().done();
    return Promise.reject(err);
  },
);
