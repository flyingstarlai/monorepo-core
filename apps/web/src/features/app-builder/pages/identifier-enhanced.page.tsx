import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/enhanced-card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CloudUpload,
  FileText,
  AlertCircle,
  CheckCircle,
  Package,
  X,
  Loader2,
  Upload,
} from 'lucide-react';
import mobileAppBuilderService, {
  type AppIdDto,
} from '../../../lib/app-builder.service';
import { useNavigate } from '@tanstack/react-router';

export function IdentifierPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            App Builder feature is disabled. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const uploadMutation = useMutation({
    mutationFn: (data: { content: string }) =>
      mobileAppBuilderService.uploadGoogleServices(data),
    onSuccess: () => {
      setUploadedFile(null);
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

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
    open,
  } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const removeFile = () => {
    setUploadedFile(null);
  };

  const openFileDialog = () => open();

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">App Identifier Management</h1>
        <p className="text-muted-foreground text-lg">
          Upload Google Services JSON files to extract and manage app
          identifiers.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Enhanced Upload Section */}
        <div className="lg:col-span-1">
          <Card variant="enhanced">
            <CardHeader>
              <CardTitle>Upload Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`upload-area ${
                  isDragActive || dropzoneActive ? 'active' : ''
                }`}
              >
                <input {...getInputProps()} />
                <CloudUpload className="w-12 h-12 mx-auto mb-4 text-primary" />

                {isDragActive || dropzoneActive ? (
                  <div className="text-center">
                    <p className="text-lg font-medium text-primary">
                      Drop file here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Release to upload
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-medium">
                      Drag & drop Google Services file
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="mt-6 p-4 bg-surface-secondary rounded-lg border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="icon-container">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeFile}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {uploadMutation.isPending && (
                <div className="mt-6">
                  <div className="flex items-center justify-center space-x-2 text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Processing file...</span>
                  </div>
                </div>
              )}

              {uploadMutation.error && (
                <Alert className="mt-6" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to process file. Please check file format and try
                    again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Identifiers Display */}
        <div className="lg:col-span-2">
          <Card variant="enhanced">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Extracted Identifiers</CardTitle>
                {identifiers && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {identifiers.length} identifier
                    {identifiers.length !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>
              {identifiers && identifiers.length > 0 && (
                <Button variant="outline" size="sm" onClick={openFileDialog}>
                  <Upload className="w-4 h-4 mr-2" />
                  Reupload
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-surface-secondary rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : identifiers && identifiers.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {identifiers.map((identifier: AppIdDto) => (
                    <div
                      key={identifier.appId}
                      className="p-4 bg-surface border border-border rounded-lg hover:bg-surface-secondary transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="icon-container">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {identifier.appId}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {identifier.packageName}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge
                          variant="default"
                          className="flex items-center gap-1 w-fit"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Identifiers Found
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Upload a Google Services JSON file to extract app
                    identifiers.
                  </p>
                  <Button size="lg" onClick={openFileDialog}>
                    <CloudUpload className="w-5 h-5 mr-2" />
                    Upload First File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
