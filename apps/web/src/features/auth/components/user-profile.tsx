import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useUpdateProfile } from '@/features/auth/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit, X, Check } from 'lucide-react';
import { LoadingOverlay } from '@/components/ui/loading';
import { toast } from 'sonner';
import { RoleService } from '@/lib/role.service';

export function UserProfile() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const updateProfile = useUpdateProfile();

  // Update local state when user data changes
  useEffect(() => {
    if (user && !isEditing) {
      setFullName(user.fullName || '');
    }
  }, [user, isEditing]);

  const handleEditProfile = () => {
    setFullName(user?.fullName || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFullName(user?.fullName || '');
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ fullName });
      setIsEditing(false);
      toast.success('個人資料更新成功');
    } catch (error) {
      toast.error('更新個人資料失敗。請重試。');
    }
  };

  if (isLoading) {
    return (
      <Card className="">
        <CardHeader className="">
          <CardTitle className="text-lg font-medium text-slate-900">
            個人資料
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-500">用戶資料無法使用</p>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <LoadingOverlay
        isLoading={updateProfile.isPending}
        message="更新個人資料中..."
      >
        <div className="mx-auto w-full max-w-7xl flex-1">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">
                  編輯個人資料
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={updateProfile.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    儲存
                  </Button>
                </div>
              </div>
              <div className="max-w-md">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  全名
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="請輸入您的全名"
                />
                <p className="text-sm text-slate-500 mt-2">
                  只有您的全名可以編輯。請聯繫系統管理員以更改其他資訊。
                </p>
              </div>
            </div>
          </div>
        </div>
      </LoadingOverlay>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-slate-900">個人資料</h3>
            <Button
              onClick={handleEditProfile}
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              編輯個人資料
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                用戶名
              </label>
              <p className="text-base text-slate-900">{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                全名
              </label>
              <p className="text-base text-slate-900">{user.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                角色
              </label>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: RoleService.getRoleColor(user.role),
                  color: 'white',
                  borderColor: RoleService.getRoleColor(user.role),
                }}
              >
                {RoleService.getRoleDisplayName(user.role)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                狀態
              </label>
              <Badge variant={user.isActive ? 'success' : 'destructive'}>
                {user.isActive ? '啟用' : '停用'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserProfileComponent() {
  return <UserProfile />;
}
