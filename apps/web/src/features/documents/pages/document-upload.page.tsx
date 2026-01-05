import { useState, useEffect } from 'react';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useNavigate, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateDocument } from '../hooks/use-documents';
import { useDocumentStages } from '../hooks/use-document-stages';
import { toast } from 'sonner';

export function DocumentUploadPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canUpload = isAdmin || isManager;

  const { data: stages, isLoading: stagesLoading } = useDocumentStages();

  const { mutate: createDocument, isPending } = useCreateDocument({
    onSuccess: () => {
      toast.success('文檔上傳成功');
      navigate({ to: '/documents' });
    },
    onError: () => {
      setUploadError('上傳失敗，請重試。');
    },
  });

  const [formData, setFormData] = useState({
    documentKind: '',
    documentNumber: '',
    documentName: '',
    version: '1.0',
    documentAccessLevel: 1,
    stageId: '',
    officeFile: null as File | null,
  });

  useEffect(() => {
    if (stages && stages.length > 0 && !formData.stageId) {
      const firstStage = stages[0];
      if (firstStage) {
        setFormData((prev) => ({ ...prev, stageId: firstStage.id }));
      }
    }
  }, [stages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const allowedExtensions = [
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.pdf',
      '.txt',
    ];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setUploadError(`不允許的檔案格式：${file.name}`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadError(`檔案大小超過限制：${file.name}（最大 100MB）`);
      return;
    }

    setFormData((prev) => ({ ...prev, officeFile: file }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.documentKind) {
      setUploadError('文檔類型為必填');
      return;
    }

    if (!formData.documentNumber) {
      setUploadError('文檔編號為必填');
      return;
    }

    if (!formData.documentName) {
      setUploadError('文檔名稱為必填');
      return;
    }

    if (!formData.stageId) {
      setUploadError('請選擇文檔階段');
      return;
    }

    if (!formData.officeFile) {
      setUploadError('請選擇檔案（Office/PDF/TXT）');
      return;
    }

    createDocument({
      documentKind: formData.documentKind,
      documentNumber: formData.documentNumber,
      documentName: formData.documentName,
      version: formData.version,
      documentAccessLevel: formData.documentAccessLevel,
      stageId: formData.stageId,
      officeFile: formData.officeFile,
    });
  };

  const goToDocuments = () => {
    navigate({ to: '/documents' });
  };

  if (!canUpload) {
    return (
      <div className="space-y-6 p-6">
        <Alert>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            您沒有權限上傳文檔。只有管理員和經理可以上傳文檔。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/documents">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回文檔列表</span>
        </Button>
      </Link>

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900">
            上傳新文檔
          </CardTitle>
          <CardDescription className="text-slate-600">
            上傳 Office、PDF 或 TXT 檔案（.doc, .docx, .xls, .xlsx, .pdf,
            .txt），最大 100MB。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Document Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentKind">文檔類型</Label>
                <Input
                  id="documentKind"
                  value={formData.documentKind}
                  onChange={(e) =>
                    handleInputChange('documentKind', e.target.value)
                  }
                  placeholder="輸入文檔類型"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">文檔編號</Label>
                <Input
                  id="documentNumber"
                  value={formData.documentNumber}
                  onChange={(e) =>
                    handleInputChange('documentNumber', e.target.value)
                  }
                  placeholder="輸入文檔編號"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentName">文檔名稱</Label>
                <Input
                  id="documentName"
                  value={formData.documentName}
                  onChange={(e) =>
                    handleInputChange('documentName', e.target.value)
                  }
                  placeholder="輸入文檔名稱"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">版本</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="輸入版本（例如：1.0）"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">文檔階段</Label>
                <Select
                  value={formData.stageId}
                  onValueChange={(value) => handleInputChange('stageId', value)}
                  disabled={stagesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇階段" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages?.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentAccessLevel">文檔存取等級</Label>
                <Select
                  value={formData.documentAccessLevel.toString()}
                  onValueChange={(value) =>
                    handleInputChange(
                      'documentAccessLevel',
                      parseInt(value, 10),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇存取等級" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="office-file">檔案</Label>
                <Input
                  id="office-file"
                  type="file"
                  accept=".doc,.docx,.xls,.xlsx,.pdf,.txt"
                  onChange={(e) => handleFileChange(e)}
                  required
                />
                {formData.officeFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    已選擇：{formData.officeFile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  允許格式：.doc, .docx, .xls, .xlsx, .pdf, .txt（最大 100MB）
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToDocuments}
                disabled={isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={isPending || !canUpload}>
                {isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-t-transparent" />
                    上傳中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    上傳文檔
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* File Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>檔案要求</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>最大大小：每個檔案 100MB</li>
            <li>允許格式：.doc, .docx, .xls, .xlsx, .pdf, .txt</li>
            <li>如需替換檔案，請選擇新檔案上傳</li>
            <li>否則僅更新文檔資訊即可</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentUploadPage;
