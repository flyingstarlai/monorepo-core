import { useEffect, useState } from 'react';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useParams, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  AlertCircle,
  FileDown,
  FileText,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useDocumentOfficeConfig,
  useDownloadDocument,
  useConversionStatus,
  useDownloadConvertedPdf,
} from '../hooks/use-documents';
import { toast } from 'sonner';
import { DocumentEditor } from '@onlyoffice/document-editor-react';

export function DocumentOfficePage() {
  const { user } = useAuthContext();
  const { id } = useParams({ from: '/_authenticated/documents/$id/office' });

  const [jobId, setJobId] = useState<string | null>(null);
  const { data: conversionStatus } = useConversionStatus(id, jobId || '');
  const {
    mutate: downloadPdf,
    mutateAsync: downloadPdfAsync,
    isPending: isDownloadingPdf,
  } = useDownloadConvertedPdf({
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${officeConfig?.config?.document?.title || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF 下載成功');
    },
    onError: (error: any) => {
      // If conversion is still in progress, we'll handle jobId in caller
      if (error?.jobId) {
        return;
      }
      toast.error('PDF 下載失敗');
    },
  });
  const { mutate: downloadOffice, isPending: isDownloadingOffice } =
    useDownloadDocument({
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileExt = officeConfig?.config?.document?.fileType || 'docx';
        link.download = `${officeConfig?.config?.document?.title || 'document'}.${fileExt}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Office 文檔下載成功');
      },
      onError: () => {
        toast.error('下載 Office 文檔失敗');
      },
    });

  const { data: officeConfig, isLoading, error } = useDocumentOfficeConfig(id);

  useEffect(() => {
    if (conversionStatus?.status === 'completed' && jobId) {
      // Auto-download once conversion completes
      downloadPdfAsync(id).catch((error: any) => {
        console.error('Auto PDF download failed', error);
      });
      setJobId(null);
    }
  }, [conversionStatus, jobId, id, downloadPdfAsync]);

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

  const handleDocumentReady = () => {
    console.log('Document is loaded');
  };

  const handleLoadComponentError = (
    errorCode: number,
    errorDescription: string,
  ) => {
    console.error('OnlyOffice component error:', errorCode, errorDescription);
    toast.error(`載入編輯器失敗: ${errorDescription}`);
  };

  const serverCanEdit = Boolean(
    officeConfig.config?.editorConfig?.user?.canEdit
      ? user?.role === 'admin' || user?.role === 'manager'
      : false,
  );
  const isViewOnly = !serverCanEdit;

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      await downloadPdf(id);
    } catch (error: any) {
      // If backend indicates conversion is still in progress,
      // capture the jobId so we can poll status and auto-download later.
      if (error?.jobId) {
        setJobId(error.jobId);
      }
    }
  };

  const handleDownloadOffice = () => {
    if (!id) return;
    downloadOffice({ id, type: 'office' });
  };

  const getOfficeFileType = (): 'Word' | 'Excel' | 'Office' => {
    const ext = officeConfig?.config?.document?.fileType;
    return ext === 'docx' ? 'Word' : ext === 'xlsx' ? 'Excel' : 'Office';
  };

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex items-center justify-between px-4 py-2 gap-2">
        <Link to="/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回文檔列表
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {officeConfig?.config?.document?.fileType && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadOffice}
              disabled={isDownloadingOffice}
            >
              {isDownloadingOffice ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              下載 {getOfficeFileType()}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {conversionStatus?.status === 'processing' ||
            conversionStatus?.status === 'pending'
              ? '轉換中...'
              : '下載 PDF'}
          </Button>
        </div>
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

      <div className="flex min-h-0 flex-1">
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
