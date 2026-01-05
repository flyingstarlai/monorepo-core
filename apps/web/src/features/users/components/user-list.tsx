import { Card, CardContent } from '@/components/ui/card';
import { UserDataTable } from './user-data-table';
import { createUserTableColumns } from './user-table-columns';
import { useUserTableActions } from './user-table-actions';
import { useUsers } from '../hooks/use-users';

export function UserList() {
  const { data: usersData, isLoading, error, refetch } = useUsers();

  const {
    handleView,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    DeleteDialog,
  } = useUserTableActions({ onRefresh: refetch });

  const columns = createUserTableColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">載入用戶資料失敗</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <div className="space-y-6">
        {/* Users Data Table with Integrated Filters */}
        <UserDataTable
          data={usersData}
          isLoading={isLoading}
          columns={columns}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteDialog />
      </div>
    </div>
  );
}
