import { useState, useEffect } from 'react';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { useNavigate, Link, useParams } from '@tanstack/react-router';
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
import { useDocument, useUpdateDocument } from '../hooks/use-documents';
import { toast } from 'sonner';

export function DocumentEditPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams({ from: '/_authenticated/documents/$id/edit' });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canUpload = isAdmin || isManager;

  const { data: document, isLoading, error } = useDocument(id);
  const { mutate: updateDocument, isPending } = useUpdateDocument({
    onSuccess: () => {
      toast.success('文檔更新成功');
      navigate({ to: '/documents' });
    },
    onError: () => {
      // Error is handled by centralized error handling
    },
  });

  const [formData, setFormData] = useState({
    documentKind: '',
    documentNumber: '',
    documentName: '',
    version: '1.0',
    documentAccessLevel: 1,
    officeFile: null as File | null,
  });

  useEffect(() => {
    if (document) {
      setFormData({
        documentKind: document.documentKind,
        documentNumber: document.documentNumber,
        documentName: document.documentName,
        version: document.version,
        documentAccessLevel: document.documentAccessLevel ?? 1,
        officeFile: null,
      });
    }
  }, [document]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(`不允許的檔案格式：${file.name}`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`檔案大小超過限制：${file.name}（最大 10MB）`);
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
      toast.error('文檔類型為必填');
      return;
    }

    if (!formData.documentNumber) {
      toast.error('文檔編號為必填');
      return;
    }

    if (!formData.documentName) {
      toast.error('文檔名稱為必填');
      return;
    }

    updateDocument({
      id: id,
      documentKind: formData.documentKind,
      documentNumber: formData.documentNumber,
      documentName: formData.documentName,
      version: formData.version,
      documentAccessLevel: formData.documentAccessLevel,
      officeFile: formData.officeFile || undefined,
    });
  };

  if (isLoading) {
    return <div className="p-4">載入文檔中...</div>;
  }

  if (error || !document) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertDescription>載入文檔失敗或文檔不存在</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!canUpload) {
    return (
      <div className="space-y-6 p-6">
        <Alert>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            您沒有權限編輯文檔。只有管理員和經理可以編輯文檔。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-4">
      <Link to="/documents" replace preload="intent">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回文檔列表</span>
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900">
            編輯文檔
          </CardTitle>
          <CardDescription className="text-slate-600">
            更新文檔資訊或替換檔案。如需替換檔案，請選擇新檔案上傳。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentKind">文檔類型</Label>
                <Input
                  id="documentKind"
                  value={formData.documentKind}
                  onChange={(e) =>
                    handleInputChange('documentKind', e.target.value)
                  }
                  placeholder="輸入文檔類型（例如：PROCEDURE、FORM）"
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

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="office-file">Office 檔案（可選）</Label>
                <Input
                  id="office-file"
                  type="file"
                  accept=".doc,.docx,.xls,.xlsx"
                  onChange={(e) => handleFileChange(e)}
                />
                {formData.officeFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    已選擇：{formData.officeFile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  允許格式：.doc, .docx, .xls, .xlsx（最大 10MB）
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit" disabled={isPending || !canUpload}>
                {isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-t-transparent" />
                    更新中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    更新文檔
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>檔案要求</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>最大大小：每個檔案 10MB</li>
            <li>允許格式：.doc, .docx, .xls, .xlsx</li>
            <li>如需替換檔案，請選擇新檔案上傳</li>
            <li>否則僅更新文檔資訊即可</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentEditPage;
