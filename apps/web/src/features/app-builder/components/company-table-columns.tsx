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
import type { Company } from '../../../lib/types';

interface CompanyTableColumnsProps {
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  onToggleStatus?: (company: Company) => void;
}

export function createCompanyTableColumns({
  onEdit,
  onDelete,
  onToggleStatus,
}: CompanyTableColumnsProps): ColumnDef<Company>[] {
  return [
    {
      accessorKey: 'companyCode',
      header: '公司代碼',
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="font-medium text-slate-900">
            {company.companyCode}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: '狀態',
      cell: ({ row }) => {
        const company = row.original;
        return (
          <Badge variant={company.isActive ? 'success' : 'outline'}>
            {company.isActive ? '啟用' : '停用'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '建立時間',
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="text-sm text-slate-600">
            {company.createdAt
              ? new Date(company.createdAt).toLocaleDateString()
              : '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: '更新時間',
      cell: ({ row }) => {
        const company = row.original;
        return (
          <div className="text-sm text-slate-600">
            {company.updatedAt
              ? new Date(company.updatedAt).toLocaleDateString()
              : '-'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const company = row.original;
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
                <DropdownMenuItem onClick={() => onToggleStatus(company)}>
                  <Eye className="mr-2 h-4 w-4" />
                  {company.isActive ? '停用' : '啟用'}
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(company)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編輯公司
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(company)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  刪除公司
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
