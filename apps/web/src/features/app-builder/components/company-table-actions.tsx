import { useState } from 'react';
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
import type { Company } from '../../../lib/types';

interface CompanyTableActionsProps {
  company: Company;
  onRefresh: () => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
}

export function useCompanyTableActions({
  company,
  onRefresh,
  onEdit,
  onDelete,
}: CompanyTableActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteDialogOpen(false);
    if (onDelete && company) {
      await onDelete(company);
      onRefresh();
    }
  };

  const DeleteDialog = () => (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>刪除公司</AlertDialogTitle>
          <AlertDialogDescription>
            您確定要刪除公司 <strong>{company.companyCode}</strong> (
            {company.companyName}) 嗎？此操作無法復原。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            確定刪除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const handleEdit = () => {
    if (onEdit && company) {
      onEdit(company);
    }
  };

  return {
    handleEdit,
    handleDelete,
    DeleteDialog,
  };
}
