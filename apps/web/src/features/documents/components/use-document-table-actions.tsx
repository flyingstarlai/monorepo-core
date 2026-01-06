import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useDeleteDocument } from '../hooks/use-documents';
import { DeleteDocumentDialog } from './delete-document-dialog';
import type { DocumentResponseDto } from '../types/documents.types';

interface DocumentTableActionsProps {
  onRefresh?: () => void;
}

export function useDocumentTableActions({
  onRefresh,
}: DocumentTableActionsProps = {}) {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string | null;
    documentNumber: string | null;
    documentName: string | null;
    isOpen: boolean;
  }>({ id: null, documentNumber: null, documentName: null, isOpen: false });

  const deleteDocumentMutation = useDeleteDocument({
    onSuccess: () => {
      setDeleteDialog({
        id: null,
        documentNumber: null,
        documentName: null,
        isOpen: false,
      });
      onRefresh?.();
    },
  });

  const handleView = (doc: DocumentResponseDto) => {
    navigate({ to: `/documents/${doc.id}/office` });
  };

  const handleEdit = (doc: DocumentResponseDto) => {
    navigate({ to: `/documents/${doc.id}/edit` });
  };

  const handleDelete = (
    id: string,
    documentNumber: string,
    documentName: string,
  ) => {
    setDeleteDialog({ id, documentNumber, documentName, isOpen: true });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    await deleteDocumentMutation.mutateAsync(deleteDialog.id);
  };

  const DeleteDialog = () => (
    <DeleteDocumentDialog
      id={deleteDialog.id}
      documentNumber={deleteDialog.documentNumber}
      documentName={deleteDialog.documentName}
      isOpen={deleteDialog.isOpen}
      onClose={() =>
        setDeleteDialog({
          id: null,
          documentNumber: null,
          documentName: null,
          isOpen: false,
        })
      }
      onConfirm={confirmDelete}
      isLoading={deleteDocumentMutation.isPending}
    />
  );

  return {
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    DeleteDialog,
  };
}
