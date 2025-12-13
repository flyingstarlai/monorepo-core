import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { PlusCircle, Pencil, Trash2, UsersRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingOverlay } from '@/components/ui/loading';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useCreateGroup,
  useDeleteGroup,
  useGroups,
  useUpdateGroup,
} from '../hooks/use-groups';
import type { Group } from '../types/group.types';
import { GroupFormDialog } from './group-form-dialog';

export function GroupList() {
  const { data: groups, isLoading } = useGroups();
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();
  const [formState, setFormState] = useState<{
    mode: 'create' | 'edit';
    group?: Group;
  } | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const sortedGroups = useMemo(() => {
    return [...(groups ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name, 'zh-Hant'),
    );
  }, [groups]);

  return (
    <div className="space-y-4">
      <LoadingOverlay isLoading={isLoading} message="載入群組中...">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>群組管理</CardTitle>
              <p className="text-muted-foreground text-sm">
                建立與管理邏輯群組，協助分類使用者
              </p>
            </div>
            <Button onClick={() => setFormState({ mode: 'create' })}>
              <PlusCircle className="mr-2 h-4 w-4" /> 建立新群組
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名稱</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="w-24 text-center">成員數</TableHead>
                    <TableHead className="w-28 text-center">狀態</TableHead>
                    <TableHead className="w-64 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!sortedGroups.length && !isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        尚未建立任何群組
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        {group.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {group.description || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{group.memberCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {group.isActive ? (
                          <Badge variant="outline">啟用</Badge>
                        ) : (
                          <Badge variant="destructive">停用</Badge>
                        )}
                      </TableCell>
                      <TableCell className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/groups/$id" params={{ id: group.id }}>
                            <UsersRound className="mr-2 h-4 w-4" /> 成員
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFormState({ mode: 'edit', group })}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> 編輯
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setGroupToDelete(group)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 刪除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </LoadingOverlay>

      <GroupFormDialog
        mode={formState?.mode ?? 'create'}
        open={!!formState}
        group={formState?.group}
        isSubmitting={
          formState?.mode === 'create'
            ? createMutation.isPending
            : updateMutation.isPending
        }
        onOpenChange={(open) => {
          if (!open) {
            setFormState(null);
          }
        }}
        onSubmit={async (values) => {
          if (formState?.mode === 'edit' && formState.group) {
            await updateMutation.mutateAsync({
              id: formState.group.id,
              payload: values,
            });
          } else {
            await createMutation.mutateAsync({
              name: values.name,
              description: values.description,
            });
          }
          setFormState(null);
        }}
      />

      <AlertDialog
        open={!!groupToDelete}
        onOpenChange={(open) => {
          if (!open) setGroupToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>刪除群組</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除「{groupToDelete?.name}」嗎？此動作會移除所有成員關聯。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">取消</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (groupToDelete) {
                    await deleteMutation.mutateAsync(groupToDelete.id);
                    setGroupToDelete(null);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? '刪除中...' : '刪除'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
