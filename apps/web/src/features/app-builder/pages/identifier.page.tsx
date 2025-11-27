import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import mobileAppBuilderService, {
  type AppIdDto,
} from '../../../lib/app-builder.service';

export function IdentifierPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: { content: string }) =>
      mobileAppBuilderService.uploadGoogleServices(data),
    onSuccess: () => {
      setUploadedFile(null);
      // Invalidate and refetch the identifiers query to show updated data immediately
      queryClient.invalidateQueries({
        queryKey: ['app-builder', 'identifiers'],
      });
    },
  });

  const { data: identifiers, isLoading } = useQuery({
    queryKey: ['app-builder', 'identifiers'],
    queryFn: () => mobileAppBuilderService.getIdentifiers(),
    refetchInterval: 30000,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.type !== 'application/json') {
          return;
        }

        setUploadedFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            JSON.parse(content);
            uploadMutation.mutate({ content });
          } catch (error) {
            console.error('Invalid JSON file:', error);
          }
        };
        reader.readAsText(file);
      }
    },
    [uploadMutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">App Identifier Management</h1>
        <p className="text-gray-600">
          Upload Google Services JSON files to extract and manage app
          identifiers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload Configuration</CardTitle>
              <CardDescription>
                Drag and drop a Google Services JSON file to extract app
                identifiers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                {isDragActive ? (
                  <p className="text-sm">Drop the file here...</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Drag & drop a JSON file here
                    </p>
                    <p className="text-xs text-gray-500">
                      or click to select a file
                    </p>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium truncate">
                      {uploadedFile.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}

              {uploadMutation.isPending && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                </div>
              )}

              {uploadMutation.error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to process file. Please check the file format and try
                    again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Identifiers</CardTitle>
              <CardDescription>
                App identifiers extracted from uploaded Google Services files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : identifiers && identifiers.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App ID</TableHead>
                        <TableHead>Package Name</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {identifiers.map((identifier: AppIdDto) => (
                        <TableRow key={identifier.appId}>
                          <TableCell className="font-medium">
                            {identifier.appId}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {identifier.packageName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="default"
                              className="flex items-center gap-1 w-fit"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No identifiers found. Upload a Google Services JSON file to
                    extract app identifiers.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
