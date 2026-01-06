import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
} from '@/features/users/hooks/use-users';
import { DepartmentDataTable } from '@/features/users/components/department-data-table';
import { createDepartmentTableColumns } from '@/features/users/components/department-table-columns';
import { useDepartmentTableActions } from '@/features/users/components/department-table-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Combobox } from '@/components/ui/combobox';
import type {
  Department,
  UpdateDepartmentData,
} from '@/features/users/types/user.types';

export const Route = createFileRoute('/_authenticated/departments/')({
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const { data: departments, isLoading, error, refetch } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    deptNo: '',
    deptName: '',
    parentDeptNo: '',
    deptLevel: 0,
    managerId: '',
    isActive: true,
  });

  const departmentOptions = [
    { value: '', label: '無上層部門' },
    ...(departments
      ?.filter((dept) => dept.isActive)
      .filter((dept) => !editingDept || dept.deptNo !== editingDept.deptNo)
      .map((dept) => ({
        value: dept.deptNo,
        label: `${dept.deptNo} - ${dept.deptName}`,
      })) || []),
  ];

  const { handleEdit, handleDelete, handleToggleStatus, DeleteDialog } =
    useDepartmentTableActions({
      onRefresh: refetch,
      onEdit: (dept) => {
        setEditingDept(dept);
        setFormData({
          deptNo: dept.deptNo,
          deptName: dept.deptName,
          parentDeptNo: dept.parentDeptNo || '',
          deptLevel: dept.deptLevel,
          managerId: dept.managerId || '',
          isActive: dept.isActive,
        });
        setIsEditOpen(true);
      },
    });

  const columns = createDepartmentTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
    departments,
  });

  const handleCreate = async () => {
    try {
      await createDepartment.mutateAsync(formData);
      setIsCreateOpen(false);
      setFormData({
        deptNo: '',
        deptName: '',
        parentDeptNo: '',
        deptLevel: 0,
        managerId: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Failed to create department:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingDept) return;
    try {
      const updateData: UpdateDepartmentData = {
        deptName: formData.deptName,
        deptLevel: formData.deptLevel,
        isActive: formData.isActive,
      };
      if (formData.parentDeptNo && formData.parentDeptNo.trim()) {
        updateData.parentDeptNo = formData.parentDeptNo;
      }
      if (formData.managerId && formData.managerId.trim()) {
        updateData.managerId = formData.managerId;
      }

      await updateDepartment.mutateAsync(updateData);
      setIsEditOpen(false);
      setEditingDept(null);
    } catch (error) {
      console.error('Failed to update department:', error);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">
          Failed to load departments: {String(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">部門管理</h1>
            <p className="text-slate-600 mt-2">管理組織架構中的部門結構。</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                新增部門
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>新增部門</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deptNo">部門代碼</Label>
                    <Input
                      id="deptNo"
                      value={formData.deptNo}
                      onChange={(e) =>
                        setFormData({ ...formData, deptNo: e.target.value })
                      }
                      placeholder="例如：IT001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentDeptNo">上層部門代碼</Label>
                    <Combobox
                      options={departmentOptions}
                      value={formData.parentDeptNo}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          parentDeptNo: value,
                        })
                      }
                      placeholder="選擇上層部門"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deptName">部門名稱</Label>
                  <Input
                    id="deptName"
                    value={formData.deptName}
                    onChange={(e) =>
                      setFormData({ ...formData, deptName: e.target.value })
                    }
                    placeholder="例如：資訊科技部"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deptLevel">部門層級</Label>
                    <Input
                      id="deptLevel"
                      type="number"
                      value={formData.deptLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deptLevel: Number(e.target.value),
                        })
                      }
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerId">管理者 ID</Label>
                    <Input
                      id="managerId"
                      value={formData.managerId}
                      onChange={(e) =>
                        setFormData({ ...formData, managerId: e.target.value })
                      }
                      placeholder="選填：管理者使用者 ID"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <Label htmlFor="active" className="cursor-pointer">
                      啟用狀態
                    </Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formData.isActive ? '部門將被啟用' : '部門將被停用'}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCreate}>新增部門</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {editingDept && (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>編輯部門</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deptNo">部門代碼</Label>
                      <Input
                        id="deptNo"
                        value={formData.deptNo}
                        disabled
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentDeptNo">上層部門代碼</Label>
                      <Combobox
                        options={departmentOptions}
                        value={formData.parentDeptNo}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            parentDeptNo: value,
                          })
                        }
                        placeholder="選擇上層部門"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deptName">部門名稱</Label>
                    <Input
                      id="deptName"
                      value={formData.deptName}
                      onChange={(e) =>
                        setFormData({ ...formData, deptName: e.target.value })
                      }
                      placeholder="例如：資訊科技部"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deptLevel">部門層級</Label>
                      <Input
                        id="deptLevel"
                        type="number"
                        value={formData.deptLevel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deptLevel: Number(e.target.value),
                          })
                        }
                        min={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerId">管理者 ID</Label>
                      <Input
                        id="managerId"
                        value={formData.managerId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerId: e.target.value,
                          })
                        }
                        placeholder="選填：管理者使用者 ID"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isActive: checked })
                        }
                      />
                      <Label htmlFor="active" className="cursor-pointer">
                        啟用狀態
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formData.isActive ? '部門將被啟用' : '部門將被停用'}
                    </span>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleUpdate}>儲存變更</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <DepartmentDataTable
          data={departments}
          isLoading={isLoading}
          columns={columns}
        />

        <DeleteDialog />
      </div>
    </div>
  );
}
