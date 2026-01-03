import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Users } from 'lucide-react';
import type { Group } from '../types/group.types';

interface GroupTableColumnsProps {
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  onToggleStatus?: (group: Group) => void;
}

export function createGroupTableColumns({
  onEdit,
  onDelete,
  onToggleStatus,
}: GroupTableColumnsProps): ColumnDef<Group>[] {
  return [
    {
      accessorKey: 'name',
      header: '名稱',
      cell: ({ row }) => {
        const group = row.original;
        return <div className="font-medium text-slate-900">{group.name}</div>;
      },
    },
    {
      accessorKey: 'description',
      header: '描述',
      cell: ({ row }) => {
        const group = row.original;
        return (
          <div className="text-sm text-slate-600">
            {group.description || '—'}
          </div>
        );
      },
    },
    {
      accessorKey: 'memberCount',
      header: '成員數',
      cell: ({ row }) => {
        const group = row.original;
        return (
          <div className="text-center">
            <Badge variant="secondary">{group.memberCount}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: '狀態',
      cell: ({ row }) => {
        const group = row.original;
        return (
          <Badge variant={group.isActive ? 'success' : 'outline'}>
            {group.isActive ? '啟用' : '停用'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const group = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">開啟選單</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/groups/$id`} params={{ id: group.id }}>
                  <Users className="mr-2 h-4 w-4" />
                  成員管理
                </Link>
              </DropdownMenuItem>
              {onToggleStatus && (
                <DropdownMenuItem onClick={() => onToggleStatus(group)}>
                  {group.isActive ? '停用' : '啟用'}
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(group)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編輯群組
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(group)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  刪除群組
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
