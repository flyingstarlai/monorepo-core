import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { Button } from '@/components/ui/button';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Account Settings
        </h2>
        <p className="text-slate-600 mt-2">
          Manage your account security and details.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-6">Security</h3>
        {showChangePassword ? (
          <ChangePasswordForm
            onSuccess={handleChangePasswordSuccess}
            onCancel={handleChangePasswordCancel}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Password</p>
                <p className="text-sm text-slate-600 mt-1">
                  Change your password to keep your account secure
                </p>
              </div>
              <Button
                onClick={() => setShowChangePassword(true)}
                variant="default"
              >
                Change Password
              </Button>
            </div>
          </div>
        )}
      </div>

      {user && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-6">
            Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                User ID
              </label>
              <p className="text-sm font-mono text-slate-600 bg-slate-50 p-3 rounded">
                {user.id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Last Login
              </label>
              <p className="text-sm text-slate-600">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Account Created
              </label>
              <p className="text-sm text-slate-600">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Last Updated
              </label>
              <p className="text-sm text-slate-600">
                {new Date(user.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
