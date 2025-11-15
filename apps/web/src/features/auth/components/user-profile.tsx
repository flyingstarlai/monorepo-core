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
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Card className="">
        <CardHeader className="">
          <CardTitle className="text-lg font-medium text-slate-900">
            Profile Information
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
          <p className="text-slate-500">User information not available</p>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <LoadingOverlay
        isLoading={updateProfile.isPending}
        message="Updating profile..."
      >
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-slate-900">
                Edit Profile
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={updateProfile.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            <div className="max-w-md">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              <p className="text-sm text-slate-500 mt-2">
                Only your full name can be edited. Contact an administrator to
                change other information.
              </p>
            </div>
          </div>
        </div>
      </LoadingOverlay>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-slate-900">
            Profile Information
          </h3>
          <Button
            onClick={handleEditProfile}
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Username
            </label>
            <p className="text-base text-slate-900">{user.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Full Name
            </label>
            <p className="text-base text-slate-900">{user.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Department
            </label>
            <p className="text-base text-slate-900">{user.deptName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Department Code
            </label>
            <p className="text-base text-slate-900">{user.deptNo}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Role
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
              Status
            </label>
            <Badge variant={user.isActive ? 'success' : 'destructive'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserProfileComponent() {
  return <UserProfile />;
}
