import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Eye } from 'lucide-react';
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

export interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  showActions?: boolean;
  isLoading?: boolean;
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

export function UserCard({
  user,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  isLoading = false,
}: UserCardProps) {
  const { user: currentUser } = useAuth();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  return (
    <Card className="">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">{initials}</span>
            </div>

            {/* User Info */}
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {displayName}
              </h3>
              <p className="text-sm text-slate-600">@{user.username}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-sm text-slate-500">
                  {user.deptName} ({user.deptNo})
                </span>
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
                <Badge variant={getStatusVariant(user.isActive)}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Last login: {formatLastLogin(user.lastLoginAt)}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(user)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(user)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && canDeleteUser(currentUser, user) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(user)}
                  className="text-red-600 hover:text-red-700"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
