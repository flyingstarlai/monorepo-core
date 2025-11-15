import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import type { User } from '../types/user.types';
import {
  getUserInitials,
  getUserDisplayName,
  getRoleVariant,
  getRoleColor,
  getStatusVariant,
  formatLastLogin,
} from '../utils/user-transformers';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface UserTableColumnsProps {
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleStatus?: (user: User, isActive: boolean) => void;
}

// Helper function to check if current user can delete target user
const canDeleteUser = (currentUser: User | null, targetUser: User): boolean => {
  if (!currentUser) return false;

  // Cannot delete yourself
  if (currentUser.id === targetUser.id) return false;

  // Admin can delete anyone
  if (currentUser.role === 'admin') return true;

  // Manager can only delete regular users
  if (currentUser.role === 'manager' && targetUser.role === 'user') return true;

  // Regular users cannot delete anyone
  return false;
};

export function createUserTableColumns({
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: UserTableColumnsProps): ColumnDef<User>[] {
  const { user: currentUser } = useAuth();
  return [
    {
      accessorKey: 'username',
      header: 'User',
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
              <div className="text-sm text-slate-500">@{user.username}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'deptName',
      header: 'Department',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div>
            <div className="font-medium">{user.deptName}</div>
            <div className="text-sm text-slate-500">{user.deptNo}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Badge
            variant={getRoleVariant(user.role)}
            style={{
              backgroundColor: getRoleColor(user.role),
              color: 'white',
              borderColor: getRoleColor(user.role),
            }}
          >
            {user.role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={user.isActive}
              onCheckedChange={(checked) => onToggleStatus?.(user, checked)}
              disabled={!onToggleStatus}
            />
            <Badge variant={getStatusVariant(user.isActive)}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-sm text-slate-600">
            {formatLastLogin(user.lastLoginAt)}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-sm text-slate-600">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(user)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && canDeleteUser(currentUser, user) && (
                <DropdownMenuItem
                  onClick={() => onDelete(user)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
