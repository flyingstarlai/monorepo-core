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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <div className="text-lg text-gray-600 mb-2">
            You don't have permission to access this page.
          </div>
          {search.reason === 'insufficient_role' && (
            <div className="text-sm text-gray-500">
              Your current role doesn't have the required permissions.
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          
          {search.redirect && (
            <Button variant="outline" asChild className="w-full">
              <Link to="/login" search={{ redirect: search.redirect }}>
                Login with Different Account
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}