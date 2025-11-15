import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { User } from '../types/user.types';
import {
  getUserInitials,
  getRoleVariant,
  getRoleColor,
  getStatusVariant,
  formatLastLogin,
  formatDate,
} from '../utils/user-transformers';
import { useAuth } from '@/features/auth/hooks/use-auth';

export interface UserDetailProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
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

export function UserDetail({
  user,
  onEdit,
  onDelete,
  isLoading = false,
}: UserDetailProps) {
  const { user: currentUser } = useAuth();
  const initials = getUserInitials(user);

  return (
    <div className="space-y-6">
      {/* Header */}
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
      </div>

      {/* User Profile Card */}
      <Card className="">
        <CardHeader className="">
          <CardTitle className="text-lg font-medium text-slate-900">
            用戶資料
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">{initials}</span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {user.fullName || '未知用戶'}
              </h1>
              <p className="text-slate-600 mb-4">
                @{user.username || 'unknown'}
              </p>

              <div className="flex items-center space-x-3">
                <Badge
                  variant={getRoleVariant(user.role)}
                  style={{
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    borderColor: getRoleColor(user.role),
                  }}
                >
                  {user.role || 'user'}
                </Badge>
                <Badge variant={getStatusVariant(user.isActive)}>
                  {user.isActive ? '啟用' : '停用'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="text-lg font-medium text-slate-900">
              個人資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">全名</label>
              <p className="text-lg font-medium text-slate-900">
                {user.fullName || '未指定'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                用戶名
              </label>
              <p className="text-lg font-medium text-slate-900">
                {user.username || '未指定'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">狀態</label>
              <div className="mt-1">
                <Badge variant={getStatusVariant(user.isActive)}>
                  {user.isActive ? '啟用' : '停用'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Information */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="text-lg font-medium text-slate-900">
              部門資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">部門</label>
              <p className="text-lg font-medium text-slate-900">
                {user.deptName || '未指定'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                部門代碼
              </label>
              <p className="text-lg font-medium text-slate-900">
                {user.deptNo}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">角色</label>
              <div className="mt-1">
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Activity */}
      <Card className="">
        <CardHeader className="">
          <CardTitle className="text-lg font-medium text-slate-900">
            帳戶活動
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700">
                最後登入
              </label>
              <p className="text-sm text-slate-900">
                {formatLastLogin(user.lastLoginAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                帳戶建立時間
              </label>
              <p className="text-sm text-slate-900">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                最後更新時間
              </label>
              <p className="text-sm text-slate-900">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
