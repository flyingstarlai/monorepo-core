import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserDataTable } from './user-data-table';
import { createUserTableColumns } from './user-table-columns';
import { useUserTableActions } from './user-table-actions';
import { useUsers } from '../hooks/use-users';
import type { UsersFilters } from '../types/user.types';

export function UserList() {
  const [filters, setFilters] = useState<UsersFilters>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUsers({
    ...filters,
    ...pagination,
  });

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

  const handlePaginationChange = (page: number, limit: number) => {
    setPagination({ page, limit });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load users data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Users Data Table with Integrated Filters */}
      <UserDataTable
        data={usersData}
        isLoading={isLoading}
        columns={columns}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        onPaginationChange={handlePaginationChange}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog />
    </div>
  );
}
