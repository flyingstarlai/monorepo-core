import { createFileRoute } from '@tanstack/react-router';
import { DocumentOfficePage } from '@/features/documents/pages/document-office.page';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSidebar } from '@/components/ui/sidebar.tsx';

export const Route = createFileRoute('/_authenticated/documents/$id/office')({
  component: OfficeRoute,
});

function OfficeRoute() {
  const navigate = useNavigate();
  const { setOpen } = useSidebar()

  useEffect(() => {
    setOpen(false)
  }, []);

  useEffect(() => {
    if (import.meta.env.VITE_FEATURE_DOC_SERVER !== 'true') {
      navigate({ to: '/documents' });
    }
  }, [navigate]);

  if (import.meta.env.VITE_FEATURE_DOC_SERVER !== 'true') {
    return (
      <div className="max-w-2xl space-y-4 p-4">
        <Alert>
          <AlertDescription>
            文檔編輯器功能已停用。請聯絡管理員。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <DocumentOfficePage />;
}
