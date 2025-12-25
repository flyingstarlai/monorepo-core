import { createFileRoute } from '@tanstack/react-router';
import { DocumentEditPage } from '@/features/documents/pages/document-edit.page';

export const Route = createFileRoute('/_authenticated/documents/$id/edit')({
  component: DocumentEditPage,
});
