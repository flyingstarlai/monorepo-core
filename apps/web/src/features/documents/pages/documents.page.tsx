import { useQuery, useMutation } from '@tanstack/react-query';
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
import { useAuthContext } from '@/features/auth/hooks/use-auth-context';
import { FileText, Download, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { documentsApi } from '../services/documents-api.service';
import { DocumentKind } from '../types/documents.types';
import { toast } from 'sonner';

export function DocumentsPage() {
  const { user } = useAuthContext();
  const [selectedKind, setSelectedKind] = useState<DocumentKind | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canUpload = isAdmin || isManager;

  // Build query parameters
  const queryParams = {
    ...(selectedKind !== 'all' && { documentKindCode: selectedKind }),
    ...(searchTerm && { search: searchTerm }),
  };

  const {
    data: documents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents', queryParams],
    queryFn: () => documentsApi.getDocuments(queryParams),
  });

  // Fetch document kinds for filtering
  const { data: documentKinds } = useQuery({
    queryKey: ['document-kinds'],
    queryFn: () => documentsApi.getDocumentKinds(),
  });

  const safeDocuments = Array.isArray(documents) ? documents : [];
  const safeDocumentKinds = Array.isArray(documentKinds) ? documentKinds : [];

  // Download mutation for file downloads
  const downloadMutation = useMutation({
    mutationFn: ({ id, type }: { id: number; type: 'office' | 'pdf' }) =>
      documentsApi.downloadDocument(id, type),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-${variables.id}-${variables.type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Download failed. Please try again.',
      );
    },
  });

  const handleDownload = (id: number, type: 'office' | 'pdf') => {
    downloadMutation.mutate({ id, type });
  };

  // Filter client-side only if needed (API handles most filtering)
  const filteredDocuments = safeDocuments.filter((doc) => {
    const matchesSearch =
      searchTerm === '' ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return <div className="p-4">Loading documents...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load documents. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documents</h1>
        {canUpload && (
          <Button onClick={() => navigate({ to: '/documents/create' })}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Label htmlFor="search">Search:</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search by document code or name..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="kind">Kind:</Label>
          <Select
            value={selectedKind}
            onValueChange={(value) =>
              setSelectedKind(value as DocumentKind | 'all')
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All kinds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              {safeDocumentKinds.map((kind) => (
                <SelectItem key={kind.id} value={kind.code}>
                  {kind.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kind</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments?.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <Badge variant="secondary">
                  {safeDocumentKinds.find(
                    (k) => k.code === doc.documentKindCode,
                  )?.name || doc.documentKindCode}
                </Badge>
              </TableCell>
              <TableCell>{doc.documentNumber}</TableCell>
              <TableCell>{doc.documentName}</TableCell>
              <TableCell>{doc.version}</TableCell>
              <TableCell>{doc.createdBy}</TableCell>
              <TableCell>{doc.createdAtUser}</TableCell>
              <TableCell>{doc.modifiedAtUser || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {/* Download Office file - only admin/manager */}
                  {canUpload && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc.id, 'office')}
                      disabled={downloadMutation.isPending}
                    >
                      <FileText className="mr-1 h-4 w-4" />
                      Office
                    </Button>
                  )}

                  {/* Download PDF file - all authenticated users */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(doc.id, 'pdf')}
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    PDF
                  </Button>

                  {/* Edit/Delete actions - only admin/manager */}
                  {canUpload && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate({ to: `/documents/${doc.id}/edit` })
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Replace
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
