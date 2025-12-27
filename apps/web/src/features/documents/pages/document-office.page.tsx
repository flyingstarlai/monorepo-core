import { useEffect, useState } from 'react';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useParams, Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="flex flex-1 flex-col px-4 py-4 min-h-0 w-full">
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">文檔編輯器</h1>
          <p className="text-slate-600 mt-1">
            {serverCanEdit
              ? '您可以在此編輯文檔，變更將自動儲存'
              : '您正在以唯讀模式查看文檔'}
          </p>
        </div>
        <Link to="/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回文檔列表
          </Button>
        </Link>
      </header>

      {isViewOnly && (
        <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            您目前以唯讀模式檢視文件。如需編輯權限，請聯絡管理員。
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {officeConfig.config && (
              <div className="flex-1 min-h-0">
                <DocumentEditor
                  id="docxEditor"
                  documentServerUrl={officeConfig.documentServerUrl}
                  config={officeConfig.config}
                  events_onDocumentReady={handleDocumentReady}
                  onLoadComponentError={handleLoadComponentError}
                  height="100%"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DocumentOfficePage;
