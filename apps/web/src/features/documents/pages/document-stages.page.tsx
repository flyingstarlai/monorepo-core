import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  useDocumentStages,
  useCreateDocumentStage,
  useUpdateDocumentStage,
  useDeleteDocumentStage,
} from '../hooks/use-document-stages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DeleteStageDialog } from '../components/delete-stage-dialog';

interface DocumentStageFormData {
  title: string;
  sortOrder: number;
}

export function DocumentStagesPage() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin';

  const { data: stages, isLoading } = useDocumentStages();
  const createStage = useCreateDocumentStage();
  const updateStage = useUpdateDocumentStage();
  const deleteStage = useDeleteDocumentStage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string | null;
    title: string | null;
    isOpen: boolean;
  }>({ id: null, title: null, isOpen: false });
  const [formData, setFormData] = useState<DocumentStageFormData>({
    title: '',
    sortOrder: stages ? stages.length + 1 : 1,
  });

  const handleAdd = () => {
    setEditingStage(null);
    setFormData({
      title: '',
      sortOrder: (stages?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (stage: {
    id: string;
    title: string;
    sortOrder: number;
  }) => {
    setEditingStage(stage.id);
    setFormData({
      title: stage.title,
      sortOrder: stage.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteDialog({ id, title, isOpen: true });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await deleteStage.mutateAsync(deleteDialog.id);
      setDeleteDialog({ id: null, title: null, isOpen: false });
      toast.success('階段刪除成功');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error('刪除失敗，請稍後再試');
        }
      } else {
        toast.error('刪除失敗，請稍後再試');
      }
    }
  };

  const isSaving = createStage.isPending || updateStage.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStage) {
        await updateStage.mutateAsync({
          id: editingStage,
          ...formData,
        });
        toast.success('階段更新成功');
      } else {
        await createStage.mutateAsync(formData);
        toast.success('階段創建成功');
      }

      setIsDialogOpen(false);
      setEditingStage(null);
      setFormData({
        title: '',
        sortOrder: stages ? stages.length + 1 : 1,
      });
    } catch (error: unknown) {
      toast.error('操作失敗，請稍後再試');
    }
  };

  if (!isAdmin) {
    return <div className="p-4">您沒有權限訪問此頁面</div>;
  }

  if (isLoading) {
    return <div className="p-4">載入中...</div>;
  }

  return (
    <Card className="border-0 shadow-sm w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">文檔階段管理</span>
              <Badge variant="secondary" className="text-xs">
                {stages?.length || 0}
              </Badge>
            </div>

            <Button onClick={handleAdd} size="sm" className="h-9">
              <Plus className="mr-1 h-4 w-4" />
              新增階段
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    排序
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    標題
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    文檔數量
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stages && stages.length > 0 ? (
                  stages.map((stage) => (
                    <TableRow
                      key={stage.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-3 px-4">
                        {stage.sortOrder}
                      </TableCell>
                      <TableCell className="py-3 px-4 font-medium">
                        {stage.title}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Badge variant="secondary">
                          {stage.documentCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(stage)}
                            className="h-8"
                          >
                            <Pencil className="mr-1 h-4 w-4" />
                            編輯
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(stage.id, stage.title)}
                            className="h-8"
                            disabled={
                              !!stage.documentCount && stage.documentCount > 0
                            }
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            刪除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Trash2 className="h-8 w-8 text-muted-foreground/50" />
                        <span>暫無階段</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingStage ? '編輯階段' : '新增階段'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">標題</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="例如：第一階段"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">排序</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      min="1"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sortOrder: parseInt(e.target.value) || 1,
                        })
                      }
                      placeholder="數字越小越靠前"
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-1 h-4 w-4" />
                    {isSaving
                      ? editingStage
                        ? '更新中...'
                        : '創建中...'
                      : editingStage
                        ? '更新'
                        : '創建'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DeleteStageDialog
            id={deleteDialog.id}
            title={deleteDialog.title}
            isOpen={deleteDialog.isOpen}
            onClose={() =>
              setDeleteDialog({ id: null, title: null, isOpen: false })
            }
            onConfirm={confirmDelete}
            isLoading={deleteStage.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentStagesPage;
