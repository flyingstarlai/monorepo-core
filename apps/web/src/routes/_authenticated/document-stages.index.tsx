import { createFileRoute } from '@tanstack/react-router';
import { DocumentStagesPage } from '@/features/documents/pages/document-stages.page';

export const Route = createFileRoute('/_authenticated/document-stages/')({
  component: DocumentStagesPage,
});
