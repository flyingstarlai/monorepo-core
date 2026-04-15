import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import type { User } from '@repo/api';
import {
  getUserInitials,
  getUserDisplayName,
  getRoleVariant,
  getRoleColor,
  formatDate,
} from '../utils/user-transformers';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface UserTableColumnsProps {
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

const canDeleteUser = (currentUser: User | null, targetUser: User): boolean => {
  if (!currentUser) return false;
  if (currentUser.id === targetUser.id) return false;
  if (currentUser.role === 'admin') return true;
  return false;
};

export function createUserTableColumns({
  onView,
  onEdit,
  onDelete,
}: UserTableColumnsProps): ColumnDef<User>[] {
  const { user: currentUser } = useAuth();
  return [
    {
      accessorKey: 'username',
      header: '用戶',
      cell: ({ row }) => {
        const user = row.original;
        const displayName = getUserDisplayName(user);
        const initials = getUserInitials(user);

        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">{initials}</span>
            </div>
            <div>
              <div className="font-medium text-slate-900">{displayName}</div>
              <div className="text-sm text-slate-500">
                @{user.username || 'unknown'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: '角色',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Badge
            variant={getRoleVariant(user.role || 'user')}
            style={{
              backgroundColor: getRoleColor(user.role || 'user'),
              color: 'white',
              borderColor: getRoleColor(user.role || 'user'),
            }}
          >
            {user.role || 'user'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '建立時間',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-sm text-slate-600">
            {formatDate(user.createdAt)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(user)}>
                  <Eye className="h-4 w-4 mr-2" />
                  查看詳情
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="h-4 w-4 mr-2" />
                  編輯
                </DropdownMenuItem>
              )}
              {onDelete && canDeleteUser(currentUser, user) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(user)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    刪除
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
