import { createFileRoute } from '@tanstack/react-router';
import { DocumentOfficePage } from '@/features/documents/pages/document-office.page';

export const Route = createFileRoute('/_authenticated/documents/$id/office')({
  component: DocumentOfficePage,
});
