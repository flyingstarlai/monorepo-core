import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, User as UserIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { User } from '../types/user.types';
import { getUserInitials, getRoleColor } from '../utils/user-transformers';
import { useAuth } from '@/features/auth/hooks/use-auth';

export interface UserDetailProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  isLoading?: boolean;
}

const canDeleteUser = (currentUser: User | null, targetUser: User): boolean => {
  if (!currentUser) return false;
  if (currentUser.id === targetUser.id) return false;
  if (currentUser.role === 'admin') return true;
  return false;
};

export function UserDetail({
  user,
  onEdit,
  onDelete,
  isLoading = false,
}: UserDetailProps) {
  const { user: authUser } = useAuth();
  const initials = getUserInitials(user);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/users">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回用戶列表</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
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
          {onDelete && canDeleteUser(authUser, user) && (
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
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-2xl">{initials}</span>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {user.fullName ?? '未知用戶'}
              </h1>
              <p className="text-slate-600 mb-4 text-lg">
                @{user.username ?? 'unknown'}
              </p>

              <div className="flex items-center space-x-3">
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    borderColor: getRoleColor(user.role),
                  }}
                  className="px-3 py-1"
                >
                  {user.role || 'user'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <UserIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">帳戶資訊</h3>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">
                  全名：{user.fullName ?? '未指定'}
                </p>
                <p className="text-sm text-slate-600">
                  用戶名：{user.username ?? '未指定'}
                </p>
                <p className="text-sm text-slate-600">
                  角色：{user.role || 'user'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
