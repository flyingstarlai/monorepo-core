import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { User } from '../types/user.types';

export interface DeleteUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (user: User) => void;
  isLoading?: boolean;
}

export function DeleteUserDialog({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteUserDialogProps) {
  const handleConfirm = () => {
    if (user) {
      onConfirm(user);
    }
  };

  // Don't allow closing during loading - completely prevent open changes when loading
  const handleOpenChange = (open: boolean) => {
    // If we're loading, don't allow any state changes
    if (isLoading) {
      return;
    }
    // Only allow closing if not loading
    if (!open) {
      onClose();
    }
  };

  // Don't render dialog if it's not open or no user data
  if (!isOpen || !user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Delete User</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              You are about to delete <strong>{user.fullName}</strong> (@
              {user.username}). This will permanently remove their account and
              all associated data.
            </AlertDescription>
          </Alert>

          <div className="mt-4 p-3 bg-slate-50 rounded-md">
            <h4 className="font-medium text-sm text-slate-900 mb-2">
              User Details:
            </h4>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <strong>Name:</strong> {user.fullName}
              </p>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Department:</strong> {user.deptName}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
