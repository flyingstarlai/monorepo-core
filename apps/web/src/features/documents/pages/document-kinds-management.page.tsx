import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  documentsApi,
  type DocumentKindFormData,
} from '../services/documents-api.service';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const message = response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export function DocumentKindsManagementPage() {
  const { user } = useAuthContext();

  // Check if user has permission to manage document kinds
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManageKinds = isAdmin || isManager;

  // Fetch document kinds
  const {
    data: documentKinds,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['document-kinds'],
    queryFn: () => documentsApi.getDocumentKinds(),
  });

  const kindsList = Array.isArray(documentKinds) ? documentKinds : [];

  // Create new document kind mutation
  const createMutation = useMutation({
    mutationFn: (data: DocumentKindFormData) =>
      documentsApi.createDocumentKind(data),
    onSuccess: () => {
      toast.success('Document kind created successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to create document kind'));
    },
  });

  // Update document kind mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<DocumentKindFormData>;
    }) => documentsApi.updateDocumentKind(id, data),
    onSuccess: () => {
      toast.success('Document kind updated successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update document kind'));
    },
  });

  // Delete document kind mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentsApi.deleteDocumentKind(id),
    onSuccess: () => {
      toast.success('Document kind deleted successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to delete document kind'));
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => documentsApi.toggleDocumentKindActive(id),
    onSuccess: () => {
      toast.success('Document kind status toggled successfully');
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, 'Failed to toggle document kind status'),
      );
    },
  });

  if (!canManageKinds) {
    return (
      <Alert>
        <AlertDescription>
          You don't have permission to manage document kinds. Only admins and
          managers can access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading document kinds...</div>;
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load document kinds. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCreate = (data: DocumentKindFormData) => {
    const payload: DocumentKindFormData = {
      ...data,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
    };
    createMutation.mutate(payload);
  };

  const handleUpdate = (id: number, data: Partial<DocumentKindFormData>) => {
    const payload: Partial<DocumentKindFormData> = {
      ...data,
      displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
    };
    updateMutation.mutate({ id, data: payload });
  };

  const handleDelete = (id: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this document kind? This action cannot be undone.',
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: number) => {
    toggleActiveMutation.mutate(id);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Kinds Management</h1>
        <Button onClick={() => window.history.back()}>
          <Plus className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Document Kind */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Document Kind</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload: DocumentKindFormData = {
                  code: String(formData.get('code') || '').trim(),
                  name: String(formData.get('name') || '').trim(),
                  description:
                    String(formData.get('description') || '').trim() ||
                    undefined,
                  displayOrder: formData.get('displayOrder')
                    ? Number(formData.get('displayOrder'))
                    : undefined,
                  isActive: true,
                };
                handleCreate(payload);
                e.currentTarget.reset();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., PROCEDURE"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Procedure"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Brief description of the document kind"
                    />
                  </div>

                  <div>
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      name="displayOrder"
                      type="number"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Document Kind
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Document Kinds List */}
        <Card>
          <CardHeader>
            <CardTitle>Document Kinds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kindsList.map((kind) => (
                    <TableRow key={kind.id}>
                      <TableCell className="font-medium">{kind.code}</TableCell>
                      <TableCell>{kind.name}</TableCell>
                      <TableCell>{kind.description || '-'}</TableCell>
                      <TableCell>{kind.displayOrder}</TableCell>
                      <TableCell>
                        <Badge
                          variant={kind.isActive ? 'default' : 'secondary'}
                        >
                          {kind.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(kind.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdate(kind.id, {
                                name: kind.name,
                                description: kind.description,
                                displayOrder: kind.displayOrder,
                              })
                            }
                            disabled={updateMutation.isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(kind.id)}
                            disabled={toggleActiveMutation.isPending}
                          >
                            {kind.isActive ? (
                              <>
                                <Trash2 className="h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(kind.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading states */}
      {(createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        toggleActiveMutation.isPending) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center">Processing request...</div>
          </div>
        </div>
      )}
    </div>
  );
}
