import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/documents')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasAnyRole(['admin', 'manager', 'user'])) {
      throw redirect({
        to: '/unauthorized',
        search: {
          redirect: location.pathname + location.search,
          reason: 'insufficient_role',
        },
      });
    }
  },
  component: DocumentsLayout,
});

function DocumentsLayout() {
  return (
    <div className="space-y-6 mx-auto w-full max-w-7xl flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">文檔管理</h1>
          <p className="text-slate-600 mt-2">查看、管理和組織您的文檔資源。</p>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
