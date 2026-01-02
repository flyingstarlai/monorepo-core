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

export interface DeleteDocumentDialogProps {
  id: string | null;
  documentNumber: string | null;
  documentName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteDocumentDialog({
  id,
  documentNumber,
  documentName,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteDocumentDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleOpenChange = (open: boolean) => {
    if (isLoading) {
      return;
    }
    if (!open) {
      onClose();
    }
  };

  if (!isOpen || !documentNumber || !documentName || !id) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>刪除文檔</span>
          </DialogTitle>
          <DialogDescription>
            您確定要刪除此文檔嗎？此操作無法撤銷。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              您即將刪除文檔 <strong>{documentNumber} - {documentName}</strong>。
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? '刪除中...' : '刪除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
