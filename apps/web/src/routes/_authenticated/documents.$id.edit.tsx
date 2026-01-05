import { createFileRoute } from '@tanstack/react-router';
import { DocumentEditPage } from '@/features/documents/pages/document-edit.page';

export const Route = createFileRoute('/_authenticated/documents/$id/edit')({
  component: DocumentEditWrapper,
});

function DocumentEditWrapper() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <DocumentEditPage />
    </div>
  );
}
