import { GroupDataTable } from './group-data-table';
import { useGroupTableActions } from './group-table-actions';
import { createGroupTableColumns } from './group-table-columns';
import { useGroups } from '../hooks/use-groups';

export function GroupList() {
  const { data: groups, isLoading } = useGroups();
  const { handleEdit, handleDelete, DeleteDialog } = useGroupTableActions();

  return (
    <>
      <GroupDataTable
        data={groups}
        isLoading={isLoading}
        columns={createGroupTableColumns({
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
      />
      <DeleteDialog />
    </>
  );
}
