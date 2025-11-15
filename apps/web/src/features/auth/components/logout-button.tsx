import { Button } from '@/components/ui/button';
import { useLogout } from '../hooks/use-auth';

export function LogoutButton() {
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Navigation is handled automatically by the logout hook
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
