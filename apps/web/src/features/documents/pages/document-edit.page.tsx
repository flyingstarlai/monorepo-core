import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';
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
import { Skeleton } from '@/components/ui/skeleton';

const fileSchema =
  typeof File === 'undefined'
    ? z.any().nullable()
    : z.instanceof(File).nullable();

const documentFormSchema = z.object({
  documentKind: z.string().min(1, '文檔類型為必填'),
  documentNumber: z.string().min(1, '文檔編號為必填'),
  documentName: z.string().min(1, '文檔名稱為必填'),
  version: z.string().min(1, '版本為必填'),
  documentAccessLevel: z.number().min(0).max(3),
  stageId: z.string(),
  officeFile: fileSchema,
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

export function DocumentEditPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams({ from: '/_authenticated/documents/$id/edit' });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canUpload = isAdmin || isManager;

  const { data: document, isLoading, error } = useDocument(id);
  const stageOptions = document?.stageOptions ?? [];
  const { mutate: updateDocument, isPending } = useUpdateDocument({
    onSuccess: () => {
      toast.success('文檔更新成功');
      navigate({ to: '/documents' });
    },
    onError: () => {
      // Error is handled by centralized error handling
    },
  });

  const form = useForm({
    defaultValues: {
      documentKind: '',
      documentNumber: '',
      documentName: '',
      version: '1.0',
      documentAccessLevel: 1,
      stageId: '',
      officeFile: null as File | null,
    },
    validators: {
      onSubmit: documentFormSchema,
    },
    onSubmit: async ({ value }) => {
      updateDocument({
        id,
        documentKind: value.documentKind,
        documentNumber: value.documentNumber,
        documentName: value.documentName,
        version: value.version,
        documentAccessLevel: value.documentAccessLevel,
        stageId: value.stageId || undefined,
        officeFile: value.officeFile || undefined,
      });
    },
  });

  useEffect(() => {
    if (document) {
      form.reset({
        documentKind: document.documentKind || '',
        documentNumber: document.documentNumber || '',
        documentName: document.documentName || '',
        version: document.version || '1.0',
        documentAccessLevel: document.documentAccessLevel ?? 1,
        stageId: document.stageId || document.stage?.id || '',
        officeFile: null,
      });
    }
  }, [document, form]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: File | null) => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      onChange(null);
      return;
    }

    const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.pdf', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(`不允許的檔案格式：${file.name}`);
      event.target.value = '';
      onChange(null);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error(`檔案大小超過限制：${file.name}（最大 100MB）`);
      event.target.value = '';
      onChange(null);
      return;
    }

    onChange(file);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-4">
        <div className="h-9 w-32">
          <Skeleton className="h-full w-full" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full mt-3" />
                <Skeleton className="h-3 w-48 mt-1" />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-4 w-58" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="documentKind"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const errorMessage = isInvalid
                    ? getErrorMessage(
                        field.state.meta.errors[0],
                        '請輸入有效的文檔類型',
                      )
                    : null;

                  return (
                    <div className="space-y-2">
                      <Label htmlFor="documentKind">文檔類型</Label>
                      <Input
                        id="documentKind"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="輸入文檔類型"
                        required
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                      )}
                    </div>
                  );
                }}
              />

              <form.Field
                name="documentNumber"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const errorMessage = isInvalid
                    ? getErrorMessage(
                        field.state.meta.errors[0],
                        '請輸入有效的文檔編號',
                      )
                    : null;

                  return (
                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">文檔編號</Label>
                      <Input
                        id="documentNumber"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="輸入文檔編號"
                        required
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                      )}
                    </div>
                  );
                }}
              />

              <form.Field
                name="documentName"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const errorMessage = isInvalid
                    ? getErrorMessage(
                        field.state.meta.errors[0],
                        '請輸入有效的文檔名稱',
                      )
                    : null;

                  return (
                    <div className="space-y-2">
                      <Label htmlFor="documentName">文檔名稱</Label>
                      <Input
                        id="documentName"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="輸入文檔名稱"
                        required
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                      )}
                    </div>
                  );
                }}
              />

              <form.Field
                name="version"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const errorMessage = isInvalid
                    ? getErrorMessage(
                        field.state.meta.errors[0],
                        '請輸入有效的版本號',
                      )
                    : null;

                  return (
                    <div className="space-y-2">
                      <Label htmlFor="version">版本</Label>
                      <Input
                        id="version"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="輸入版本（例如：1.0）"
                        required
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                      )}
                    </div>
                  );
                }}
              />

              <form.Field
                name="stageId"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="stage">文檔階段</Label>
                    <Select
                      defaultValue={document?.stageId || ''}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇階段" />
                      </SelectTrigger>
                      <SelectContent>
                        {stageOptions.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <form.Field
                name="documentAccessLevel"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const errorMessage = isInvalid
                    ? getErrorMessage(
                        field.state.meta.errors[0],
                        '請選擇有效的存取等級',
                      )
                    : null;

                  return (
                    <div className="space-y-2">
                      <Label htmlFor="documentAccessLevel">文檔存取等級</Label>
                      <Select
                        value={field.state.value?.toString() ?? '1'}
                        onValueChange={(value) =>
                          field.handleChange(parseInt(value, 10))
                        }
                      >
                        <SelectTrigger aria-invalid={isInvalid}>
                          <SelectValue placeholder="選擇存取等級" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                      {isInvalid && errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                      )}
                    </div>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
               <form.Field
                 name="officeFile"
                 children={(field) => (
                   <div className="space-y-2">
                     <Label htmlFor="office-file">檔案（可選）</Label>
                     <Input
                       id="office-file"
                       type="file"
                       accept=".doc,.docx,.xls,.xlsx,.pdf,.txt"
                       onChange={(e) => handleFileChange(e, field.handleChange)}
                       disabled={isPending}
                     />
                     {field.state.value && (
                       <p className="text-sm text-muted-foreground mt-1">
                         已選擇：{field.state.value.name}
                       </p>
                     )}
                     <p className="text-xs text-muted-foreground mt-1">
                       允許格式：.doc, .docx, .xls, .xlsx, .pdf, .txt（最大 100MB）
                     </p>
                   </div>
                 )}
               />
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

export default DocumentEditPage;
