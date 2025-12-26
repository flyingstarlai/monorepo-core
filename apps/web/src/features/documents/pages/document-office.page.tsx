import { useState, useEffect } from 'react';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDocumentOfficeConfig } from '../hooks/use-documents';
import { toast } from 'sonner';

export function DocumentOfficePage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams({ from: '/_authenticated/documents/$id/office' });

  const {
    data: officeConfig,
    isLoading,
    error,
  } = useDocumentOfficeConfig(id, {
    onError: () => {
      toast.error('載入文檔失敗');
    },
  });

  const [onlyOfficeUrl, setOnlyOfficeUrl] = useState<string>('');

  useEffect(() => {
    if (officeConfig && officeConfig.documentServerUrl && officeConfig.token) {
      const encodedConfig = encodeURIComponent(
        JSON.stringify(officeConfig.token),
      );
      setOnlyOfficeUrl(
        `${officeConfig.documentServerUrl}/?config=${encodedConfig}`,
      );
    }
  }, [officeConfig]);

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

  return (
    <div className="max-w-7xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">文檔編輯器</h1>
          <p className="text-slate-600 mt-2">
            {user?.role === 'admin' || user?.role === 'manager'
              ? '您可以在此編輯文檔，變更將自動儲存'
              : '您正在以唯讀模式查看文檔'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {onlyOfficeUrl ? (
            <iframe
              src={onlyOfficeUrl}
              className="w-full h-[calc(100vh-200px)] border-0"
              title="OnlyOffice Editor"
              allowFullScreen
            />
          ) : (
            <div className="p-4">載入編輯器中...</div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Link to="/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回文檔列表
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default DocumentOfficePage;
