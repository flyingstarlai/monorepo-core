import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { Button } from '@/components/ui/button';
import {
  formatLastLogin,
  formatDate,
} from '@/features/users/utils/user-transformers';

export const Route = createFileRoute('/_authenticated/settings/account')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuthContext();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleChangePasswordSuccess = () => {
    setShowChangePassword(false);
  };

  const handleChangePasswordCancel = () => {
    setShowChangePassword(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">帳戶設定</h2>
          <p className="text-slate-600 mt-2">管理您的帳戶安全和詳細資訊。</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-6">安全性</h3>
          {showChangePassword ? (
            <ChangePasswordForm
              onSuccess={handleChangePasswordSuccess}
              onCancel={handleChangePasswordCancel}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">密碼</p>
                  <p className="text-sm text-slate-600 mt-1">
                    更改您的密碼以保護帳戶安全
                  </p>
                </div>
                <Button
                  onClick={() => setShowChangePassword(true)}
                  variant="default"
                >
                  更改密碼
                </Button>
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-medium text-slate-900 mb-6">
              帳戶詳情
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  用戶ID
                </label>
                <p className="text-sm font-mono text-slate-600 bg-slate-50 p-3 rounded">
                  {user.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  最後登入
                </label>
                <p className="text-sm text-slate-600">
                  {formatLastLogin(user.lastLoginAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  帳戶建立時間
                </label>
                <p className="text-sm text-slate-600">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  最後更新時間
                </label>
                <p className="text-sm text-slate-600">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
