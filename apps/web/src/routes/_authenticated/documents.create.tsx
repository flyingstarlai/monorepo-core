import { createFileRoute } from '@tanstack/react-router';
import DocumentUploadPage from '@/features/documents/pages/document-upload.page.tsx';

export const Route = createFileRoute('/_authenticated/documents/create')({
  component: DocumentUploadPage,
});
