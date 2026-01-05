import { createFileRoute } from '@tanstack/react-router';
import { UserList } from '@/features/users/components/user-list';

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersIndex,
});

function UsersIndex() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <UserList />
    </div>
  );
}
