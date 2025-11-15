import { createFileRoute } from '@tanstack/react-router';
import { UserForm } from '@/features/users/components/user-form';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useCreateUser } from '@/features/users/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type {
  CreateUserData,
  UpdateUserData,
} from '@/features/users/types/user.types';

export const Route = createFileRoute('/_authenticated/users/create')({
  component: UsersCreate,
});

function UsersCreate() {
  const { user } = useAuthContext();
  const createUserMutation = useCreateUser();
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateUserData | UpdateUserData) => {
    try {
      // Type guard to ensure we have CreateUserData
      if ('username' in data && 'password' in data) {
        await createUserMutation.mutateAsync(data as CreateUserData);
        navigate({ to: '/users' });
      } else {
        throw new Error(
          'Username and password are required for creating users',
        );
      }
    } catch (error) {
      console.error('Create user failed:', error);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Back Button */}
      <Link to="/users">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Button>
      </Link>

      {/* User Form */}
      <UserForm
        onSubmit={handleSubmit}
        isLoading={createUserMutation.isPending}
        currentUserRole={user?.role}
        title="Create New User"
        description={
          user?.role === 'manager'
            ? 'As a manager, you can only create users with "user" role.'
            : 'Create a new user with appropriate permissions.'
        }
      />
    </div>
  );
}
