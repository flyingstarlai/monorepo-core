import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User as UserIcon,
  Smartphone,
} from 'lucide-react';
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
import { UserLoginHistory } from './user-login-history';

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
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-2xl">{initials}</span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {user.fullName || '未知用戶'}
              </h1>
              <p className="text-slate-600 mb-4 text-lg">
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
                  className="px-3 py-1"
                >
                  {user.role || 'user'}
                </Badge>
                <Badge
                  variant={getStatusVariant(user.isActive)}
                  className="px-3 py-1"
                >
                  {user.isActive ? '啟用' : '停用'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Login Overview */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Smartphone className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                最後行動登入
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">
                  時間：
                  {user.lastMobileLoginAt
                    ? formatLastLogin(user.lastMobileLoginAt)
                    : '無'}
                </p>
                <p className="text-sm text-slate-600">
                  裝置：{user.lastMobileDeviceId || '無'}
                </p>
                <p className="text-sm text-slate-600">
                  應用程式：{user.lastMobileAppName || '無'}
                </p>
                <p className="text-sm text-slate-600">
                  版本：{user.lastMobileAppVersion || '無'}
                </p>
                <p className="text-sm text-slate-600">
                  模組：{user.lastMobileAppModule || '無'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="account-info" className="w-full">
        <TabsList className="inline-flex h-9 w-80 items-center rounded-lg bg-slate-100 p-1">
          <TabsTrigger
            value="account-info"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            帳戶資訊
          </TabsTrigger>
          <TabsTrigger
            value="mobile-history"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            行動登入歷史
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account-info" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  個人資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    全名
                  </label>
                  <p className="text-base font-medium text-slate-900">
                    {user.fullName || '未指定'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    用戶名
                  </label>
                  <p className="text-base font-medium text-slate-900">
                    {user.username || '未指定'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    狀態
                  </label>
                  <div className="mt-2">
                    <Badge
                      variant={getStatusVariant(user.isActive)}
                      className="px-3 py-1"
                    >
                      {user.isActive ? '啟用' : '停用'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  部門資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    部門
                  </label>
                  <p className="text-base font-medium text-slate-900">
                    {user.deptName || '未指定'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    部門代碼
                  </label>
                  <p className="text-base font-medium text-slate-900">
                    {user.deptNo}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    角色
                  </label>
                  <div className="mt-2">
                    <Badge
                      variant={getRoleVariant(user.role)}
                      style={{
                        backgroundColor: getRoleColor(user.role),
                        color: 'white',
                        borderColor: getRoleColor(user.role),
                      }}
                      className="px-3 py-1"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                帳戶活動
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    最後網頁登入
                  </label>
                  <p className="text-base text-slate-900">
                    {formatLastLogin(user.lastLoginAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    最後應用程式登入
                  </label>
                  <p className="text-base text-slate-900">
                    {formatLastLogin(user.lastMobileLoginAt)}
                  </p>
                  {user.lastMobileDeviceId && (
                    <div className="mt-2 text-sm text-slate-600">
                      裝置 ID: {user.lastMobileDeviceId}
                    </div>
                  )}
                  {user.lastMobileAppName && (
                    <div className="mt-1 text-sm text-slate-600">
                      應用名稱: {user.lastMobileAppName}
                    </div>
                  )}
                  {user.lastMobileAppVersion && (
                    <div className="mt-1 text-sm text-slate-600">
                      版本: {user.lastMobileAppVersion}
                    </div>
                  )}
                  {user.lastMobileAppModule && (
                    <div className="mt-1 text-sm text-slate-600">
                      模組: {user.lastMobileAppModule}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    帳戶建立時間
                  </label>
                  <p className="text-base text-slate-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    最後更新時間
                  </label>
                  <p className="text-base text-slate-900">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile-history" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <UserLoginHistory userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
