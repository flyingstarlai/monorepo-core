import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import type { Department } from '../types/user.types';

interface DepartmentTableColumnsProps {
  onEdit?: (dept: Department) => void;
  onDelete?: (dept: Department) => void;
  onToggleStatus?: (dept: Department) => void;
  departments?: Department[] | undefined;
}

export function createDepartmentTableColumns({
  onEdit,
  onDelete,
  onToggleStatus,
  departments,
}: DepartmentTableColumnsProps): ColumnDef<Department>[] {
  return [
    {
      accessorKey: 'deptNo',
      header: '代碼',
      cell: ({ row }) => {
        const dept = row.original;
        return <div className="font-medium text-slate-900">{dept.deptNo}</div>;
      },
    },
    {
      accessorKey: 'deptName',
      header: '名稱',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="font-medium text-slate-900">
            <div>{dept.deptNo}</div>
            <div>{dept.deptName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'parentDeptNo',
      header: '上層部門',
      cell: ({ row }) => {
        const dept = row.original;
        const parentDept = departments?.find(
          (d) => d.deptNo === dept.parentDeptNo,
        );
        const displayValue = parentDept
          ? `${dept.parentDeptNo} - ${parentDept.deptName}`
          : dept.parentDeptNo || '-';

        return <div className="text-sm text-slate-600">{displayValue}</div>;
      },
    },
    {
      accessorKey: 'deptLevel',
      header: '層級',
      cell: ({ row }) => {
        const dept = row.original;
        return <div className="text-sm text-slate-600">{dept.deptLevel}</div>;
      },
    },
    {
      accessorKey: 'managerId',
      header: '管理者',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="text-sm text-slate-600">{dept.managerId || '-'}</div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: '狀態',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <Badge variant={dept.isActive ? 'success' : 'outline'}>
            {dept.isActive ? '啟用' : '停用'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '建立時間',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="text-sm text-slate-600">
            {dept.createdAt
              ? new Date(dept.createdAt).toLocaleDateString()
              : '-'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const dept = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">開啟選單</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onToggleStatus && (
                <DropdownMenuItem onClick={() => onToggleStatus(dept)}>
                  <Eye className="mr-2 h-4 w-4" />
                  {dept.isActive ? '停用' : '啟用'}
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(dept)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編輯部門
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(dept)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  刪除部門
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
