import { useEffect, useState } from 'react';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useParams, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDocumentOfficeConfig } from '../hooks/use-documents';
import { toast } from 'sonner';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { useSidebar } from '@/components/ui/sidebar';

export function DocumentOfficePage() {
  const { user } = useAuthContext();
  const { id } = useParams({ from: '/_authenticated/documents/$id/office' });
  const { setOpen } = useSidebar();

  const { data: officeConfig, isLoading, error } = useDocumentOfficeConfig(id);

  const [, setDocumentReady] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error('載入文檔失敗');
    }
  }, [error]);

  const handleDocumentReady = () => {
    console.log('Document is loaded');
    setDocumentReady(true);
  };

  const handleLoadComponentError = (
    errorCode: number,
    errorDescription: string,
  ) => {
    console.error('OnlyOffice component error:', errorCode, errorDescription);
    toast.error(`載入編輯器失敗: ${errorDescription}`);
  };

  if (isLoading) {
    return <div className="p-4">載入文檔編輯器中...</div>;
  }

  if (error || !officeConfig) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>載入文檔失敗或文檔不存在</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!officeConfig.documentServerUrl || !officeConfig.config) {
    return (
      <div className="space-y-6 p-6">
        <Alert>
          <AlertDescription>載入文檔配置中...</AlertDescription>
        </Alert>
      </div>
    );
  }

  const serverCanEdit = Boolean(
    officeConfig.config?.editorConfig?.user?.canEdit ??
      (user?.role === 'admin' || user?.role === 'manager'),
  );
  const isViewOnly = !serverCanEdit;

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full">
      <header className="flex items-center justify-between px-4 py-2">
        <Link to="/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回文檔列表
          </Button>
        </Link>
      </header>

      {isViewOnly && (
        <div className="px-4 pb-2">
          <Alert className="border-amber-200 bg-amber-50 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              您目前以唯讀模式檢視文件。如需編輯權限，請聯絡管理員。
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {officeConfig.config && (
          <DocumentEditor
            id="docxEditor"
            documentServerUrl={officeConfig.documentServerUrl}
            config={officeConfig.config}
            events_onDocumentReady={handleDocumentReady}
            onLoadComponentError={handleLoadComponentError}
            height="100%"
          />
        )}
      </div>
    </div>
  );
}

export default DocumentOfficePage;
