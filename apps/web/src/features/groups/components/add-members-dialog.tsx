import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/features/users/hooks/use-users';
import { useAddGroupMembers } from '../hooks/use-groups';
import type { User } from '@/features/users/types/user.types';
import { toast } from 'sonner';

interface AddMembersDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludedUserIds: string[];
}

export function AddMembersDialog({
  groupId,
  open,
  onOpenChange,
  excludedUserIds,
}: AddMembersDialogProps) {
  const { data: users, isLoading } = useUsers();
  const mutation = useAddGroupMembers(groupId);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const availableUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (users ?? [])
      .filter((user): user is User => user != null && user.id != null)
      .filter((user) => !excludedUserIds.includes(user.id))
      .filter((user) => {
        if (!keyword) return true;
        const fullName = user.fullName || '';
        const username = user.username || '';
        const deptName = user.deptName || '';
        return (
          fullName.toLowerCase().includes(keyword) ||
          username.toLowerCase().includes(keyword) ||
          deptName.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const nameA = a.fullName || a.username || '';
        const nameB = b.fullName || b.username || '';
        return nameA.localeCompare(nameB, 'zh-Hant');
      });
  }, [users, excludedUserIds, search]);

  const toggleSelection = (userId: string) => {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async () => {
    if (!selected.length) {
      toast.error('請至少選擇一位使用者');
      return;
    }
    await mutation.mutateAsync(selected);
    setSelected([]);
    setSearch('');
    onOpenChange(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelected([]);
      setSearch('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>新增群組成員</DialogTitle>
          <DialogDescription>搜尋並勾選要加入該群組的使用者</DialogDescription>
        </DialogHeader>

        <Input
          placeholder="搜尋姓名、帳號或部門"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="rounded-md border">
          <div className="h-64 w-full overflow-y-auto">
            <div className="divide-y">
              {isLoading && (
                <p className="p-4 text-sm text-muted-foreground">
                  載入使用者...
                </p>
              )}
              {!isLoading && !availableUsers.length && (
                <p className="p-4 text-sm text-muted-foreground">
                  沒有可加入的使用者
                </p>
              )}
              {availableUsers.map((user: User) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/60"
                >
                  <Checkbox
                    checked={selected.includes(user.id)}
                    onCheckedChange={() => toggleSelection(user.id)}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.fullName}{' '}
                      <span className="text-muted-foreground text-xs">
                        ({user.username})
                      </span>
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {user.deptName}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending || !selected.length}
          >
            {mutation.isPending ? '新增中...' : '加入選取的使用者'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
