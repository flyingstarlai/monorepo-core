import { createFileRoute } from '@tanstack/react-router';
import { DocumentsPage } from '@/features/documents/pages/documents.page';

export const Route = createFileRoute('/_authenticated/documents/')({
  component: DocumentsPage,
});
