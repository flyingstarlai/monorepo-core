import { createFileRoute, redirect, useSearch } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/login-form';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async ({ context }) => {
    await context.authInit;
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search.redirect as string | undefined,
  }),
});

function Login() {
  const search = useSearch({ from: '/login' }) as { redirect?: string };

  useEffect(() => {
    if (
      search.redirect &&
      typeof search.redirect === 'string' &&
      search.redirect !== '/login'
    ) {
      localStorage.setItem('intended_destination', search.redirect);
    }
  }, [search.redirect]);

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              Mono-Core
            </span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              企業級管理
              <br />
              系統平台
            </h1>
          </div>
        </div>

        <div className="relative z-10" />

        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900 tracking-tight">
              Mono-Core
            </span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
