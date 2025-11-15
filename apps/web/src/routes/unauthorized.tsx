import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/unauthorized')({
  component: Unauthorized,
});

function Unauthorized() {
  const search = Route.useSearch();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">存取被拒</h1>
          <div className="text-lg text-gray-600 mb-2">
            您沒有權限存取此頁面。
          </div>
          {search.reason === 'insufficient_role' && (
            <div className="text-sm text-gray-500">
              您目前的角色沒有所需權限。
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/dashboard">前往儀表板</Link>
          </Button>

          {search.redirect && (
            <Button variant="outline" asChild className="w-full">
              <Link to="/login" search={{ redirect: search.redirect }}>
                使用不同帳戶登入
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
