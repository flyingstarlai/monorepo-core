import { createFileRoute, redirect, useSearch } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/login-form';
import { useEffect } from 'react';

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async ({ context }) => {
    // Wait for global auth initialization promise
    await context.authInit;

    // Check authentication status from router context
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search.redirect as string | undefined,
  }),
});

function Login() {
  const search = useSearch({ from: '/login' });

  useEffect(() => {
    // Check for redirect parameter using TanStack Router search params
    if (search.redirect && search.redirect !== '/login') {
      localStorage.setItem('intended_destination', search.redirect);
    }
  }, [search.redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm />
      </div>
    </div>
  );
}
