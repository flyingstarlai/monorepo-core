import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { Plus, Search, FileDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from '@tanstack/react-router';
import { useDocuments, useDownloadDocument } from '../hooks/use-documents';
import { toast } from 'sonner';

const getOfficeFileType = (filePath: string): 'Word' | 'Excel' | 'Office' => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  if (extension === 'docx') return 'Word';
  if (extension === 'xlsx') return 'Excel';
  return 'Office';
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

export function DocumentsPage() {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canUpload = isAdmin || isManager;

  const { data: documents, isLoading } = useDocuments({
    documentKind: searchTerm,
    search: searchTerm,
  });

  const { mutate: downloadDocument } = useDownloadDocument({
    onError: (error) => {
      console.error('Download error:', error);
    },
  });

  const safeDocuments = Array.isArray(documents) ? documents : [];
  const filteredDocuments = safeDocuments.filter(
    (doc) =>
      searchTerm === '' ||
      doc.documentKind?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return <div className="p-4">載入文檔中...</div>;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileDown className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">文檔</span>
              <Badge variant="secondary" className="text-xs">
                {filteredDocuments.length} / {safeDocuments.length}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋文檔..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48 h-9 text-sm"
                />
              </div>

              {canUpload && (
                <Button
                  onClick={() => navigate({ to: '/documents/create' })}
                  size="sm"
                  className="h-9"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  上傳文檔
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    類型
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    代碼
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    名稱
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    版本
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    創建者
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    創建時間
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    最後修改
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    最後下載
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-3 px-4">
                        <Badge variant="secondary">
                          {doc.documentKind || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {doc.documentNumber}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {doc.documentName}
                      </TableCell>
                      <TableCell className="py-3 px-4">{doc.version}</TableCell>
                      <TableCell className="py-3 px-4">
                        {doc.createdBy}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {formatDate(doc.createdAtUser)}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {formatDate(doc.modifiedAtUser)}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {doc.downloadedBy && doc.downloadedAtUser
                          ? `${doc.downloadedBy} @ ${formatDate(doc.downloadedAtUser)}`
                          : '-'}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {canUpload && doc.officeFilePath && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                downloadDocument(
                                  { id: doc.id, type: 'office' },
                                  {
                                    onSuccess: (blob) => {
                                      const url =
                                        window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `${doc.documentNumber || `document-${doc.id}`}-office`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                      toast.success('文檔下載成功');
                                    },
                                  },
                                );
                              }}
                              title={doc.officeFilePath}
                              className="h-8"
                            >
                              <FileDown className="mr-1 h-4 w-4" />
                              下載 {getOfficeFileType(doc.officeFilePath)}
                            </Button>
                          )}

                          {doc.pdfFilePath && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                downloadDocument(
                                  { id: doc.id, type: 'pdf' },
                                  {
                                    onSuccess: (blob) => {
                                      const url =
                                        window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `${doc.documentNumber || `document-${doc.id}`}-pdf.pdf`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                      toast.success('文檔下載成功');
                                    },
                                  },
                                );
                              }}
                              title={doc.pdfFilePath}
                              className="h-8"
                            >
                              <FileDown className="mr-1 h-4 w-4" />
                              下載 PDF
                            </Button>
                          )}

                          {canUpload && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate({ to: `/documents/${doc.id}/edit` })
                              }
                              className="h-8"
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              編輯
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <FileDown className="h-8 w-8 text-muted-foreground/50" />
                        <span>找不到符合的文檔</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
