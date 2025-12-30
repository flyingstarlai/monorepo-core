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
import { Plus, Search, FileDown, FileEdit, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from '@tanstack/react-router';
import { useDocuments } from '../hooks/use-documents';
import { useDocumentStages } from '../hooks/use-document-stages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

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

interface DocumentTableProps {
  documents: any[];
  isLoading?: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canUpload: boolean;
  navigate: any;
}

function DocumentTable({
  documents,
  isLoading,
  isAdmin,
  isManager,
  canUpload,
  navigate,
}: DocumentTableProps) {
  const columnWidths = [
    'w-20',
    'w-24',
    'flex-1',
    'w-16',
    'w-20',
    'w-32',
    'w-32',
    'w-32',
    'w-40',
  ];

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <div className="border-b bg-muted/30 p-4">
          <div className="flex items-center space-x-4">
            {columnWidths.map((width, i) => (
              <Skeleton key={i} className={`h-4 ${width}`} />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {[...Array(6)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4 p-4">
              {columnWidths.map((width, colIndex) => (
                <Skeleton key={colIndex} className={`h-8 ${width}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
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
          {documents.length > 0 ? (
            documents.map((doc) => (
              <TableRow
                key={doc.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="py-3 px-4">
                  <Badge variant="secondary">{doc.documentKind || '-'}</Badge>
                </TableCell>
                <TableCell className="py-3 px-4">
                  {doc.documentNumber}
                </TableCell>
                <TableCell className="py-3 px-4">{doc.documentName}</TableCell>
                <TableCell className="py-3 px-4">{doc.version}</TableCell>
                <TableCell className="py-3 px-4">{doc.createdBy}</TableCell>
                <TableCell className="py-3 px-4">
                  {doc.createdAtUser ? (
                    <div className="flex flex-col gap-0">
                      <span className="text-sm">
                        {formatDate(doc.createdAtUser).split(' ')[0]}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(doc.createdAtUser).split(' ')[1]}
                      </span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="py-3 px-4">
                  {doc.modifiedAtUser ? (
                    <div className="flex flex-col gap-0">
                      <span className="text-sm">
                        {formatDate(doc.modifiedAtUser).split(' ')[0]}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(doc.modifiedAtUser).split(' ')[1]}
                      </span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="py-3 px-4">
                  {doc.downloadedBy && doc.downloadedAtUser ? (
                    <div className="flex flex-col gap-0">
                      <span className="text-sm">{doc.downloadedBy}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(doc.downloadedAtUser).split(' ')[0]}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(doc.downloadedAtUser).split(' ')[1]}
                      </span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {doc.officeFilePath &&
                      import.meta.env.VITE_FEATURE_DOC_SERVER === 'true' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate({
                              to: `/documents/${doc.id}/office`,
                            })
                          }
                          title={isAdmin || isManager ? '開啟文檔' : '在線查看'}
                          className="h-8"
                        >
                          <FileEdit className="mr-1 h-4 w-4" />
                          {isAdmin || isManager ? '開啟文檔' : '在線查看'}
                        </Button>
                      )}

                    {canUpload && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate({
                            to: `/documents/${doc.id}/edit`,
                          })
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
  );
}

export function DocumentsPage() {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageId, setSelectedStageId] = useState<string | undefined>(
    undefined,
  );
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canUpload = isAdmin || isManager;

  const { data: documents, isLoading } = useDocuments({
    documentKind: searchTerm,
    search: searchTerm,
    stageId: selectedStageId,
  });

  const { data: stages } = useDocumentStages();

  const safeDocuments = Array.isArray(documents) ? documents : [];
  const filteredDocuments = safeDocuments.filter(
    (doc) =>
      searchTerm === '' ||
      doc.documentKind?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const defaultStageId = stages && stages.length > 0 ? stages[0]?.id : '';
  const activeStageId = selectedStageId ?? defaultStageId;

  return (
    <Card className="border-0 shadow-sm w-full">
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

          <div className="w-full overflow-x-auto">
            <Tabs
              value={activeStageId}
              onValueChange={(value) => setSelectedStageId(value)}
              className="w-full"
            >
              <div className="flex items-center justify-between gap-4">
                <TabsList className="inline-flex h-9 min-w-[400px] flex-1 items-center rounded-lg bg-slate-100 p-1">
                  {stages?.map((stage) => (
                    <TabsTrigger
                      key={stage.id}
                      value={stage.id}
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                    >
                      {stage.title} ({stage.documentCount || 0})
                    </TabsTrigger>
                  ))}
                </TabsList>

                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate({ to: '/documents/stages' })}
                    className="h-9 w-9 p-0"
                    title="階段管理"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {activeStageId && (
                <TabsContent value={activeStageId} className="mt-4">
                  <DocumentTable
                    documents={filteredDocuments}
                    isLoading={isLoading}
                    isAdmin={isAdmin}
                    isManager={isManager}
                    canUpload={canUpload}
                    navigate={navigate}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
