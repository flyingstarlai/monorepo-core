import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import document types and services
import {
  documentsApi,
  ALLOWED_OFFICE_FILE_TYPES,
  ALLOWED_PDF_FILE_TYPES,
} from '../services/documents-api.service';
import {
  validateDocumentFormData,
  formatDocumentValidationErrors,
} from '../utils/document-validation';
import { DocumentKind } from '../types/documents.types';

// File validation constants - will be moved to validation utility
// const ALLOWED_OFFICE_FILE_TYPES = ['.docx', '.xlsx'];
// const ALLOWED_PDF_FILE_TYPES = ['.pdf'];

export function DocumentUploadPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    dockind: '' as DocumentKind | '',
    docno: '',
    docna: '',
    docver: '1.0',
    docfile: null as File | null,
    docfilepdf: null as File | null,
  });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canUpload = isAdmin || isManager;

  const uploadMutation = useMutation({
    mutationFn: documentsApi.createDocument,
    onSuccess: (data) => {
      setIsUploading(false);
      setUploadProgress(100);
      setUploadSuccess(`Document "${data.docna}" uploaded successfully!`);
      setTimeout(() => {
        setUploadSuccess(null);
        navigate({ to: '/documents' });
      }, 2000);
    },
    onError: (error: any) => {
      setIsUploading(false);
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          'Upload failed. Please try again.',
      );
      setTimeout(() => setUploadError(null), 5000);
    },
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'office' | 'pdf',
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = type === 'office' ? 'office' : 'pdf';
    const validation = documentsApi.validateFile(
      file,
      fileType === 'office'
        ? ALLOWED_OFFICE_FILE_TYPES
        : ALLOWED_PDF_FILE_TYPES,
    );

    if (!validation.isValid) {
      setUploadError(validation.error || 'Validation failed');
      return;
    }

    setUploadError(null);

    // Update form data with the selected file
    if (type === 'office') {
      setFormData((prev) => ({ ...prev, docfile: file }));
    } else {
      setFormData((prev) => ({ ...prev, docfilepdf: file }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate document kind exists
    if (formData.dockind) {
      try {
        // This will be handled by the API service validation
        // For now, just ensure it's not empty
      } catch (error) {
        setUploadError('Failed to validate document kind');
      }
    }

    const validationErrors = validateDocumentFormData({
      dockind: formData.dockind,
      docno: formData.docno,
      docna: formData.docna,
      docver: formData.docver,
    });

    if (validationErrors.length > 0) {
      setUploadError(
        formatDocumentValidationErrors(validationErrors).join(', '),
      );
      return;
    }

    if (!formData.docfile && !formData.docfilepdf) {
      setUploadError('Please select at least one file (Office or PDF).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formDataToSend = documentsApi.prepareDocumentFormData(
      {
        dockind: formData.dockind,
        docno: formData.docno,
        docna: formData.docna,
        docver: formData.docver,
      },
      formData.docfile || undefined,
      formData.docfilepdf || undefined,
      user?.id,
    );

    try {
      await uploadMutation.mutateAsync(formDataToSend);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
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
            You don't have permission to upload documents. Only admins and
            managers can upload documents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link
          to="/documents"
          className="hover:text-foreground transition-colors hover:underline"
        >
          Documents
        </Link>
        <span className="text-muted">/</span>
        <span className="text-foreground">Upload New Document</span>
      </nav>

      {/* Success/Error Messages */}
      {uploadSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription>{uploadSuccess}</AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Document</CardTitle>
          <CardDescription>
            Fill in the document details below to create a new document.
            Separate file uploads are supported for Office (.docx, .xlsx) and
            PDF (.pdf) files.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Document Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kind">Document Kind</Label>
                <Select
                  value={formData.dockind}
                  onValueChange={(value) => handleInputChange('dockind', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document kind" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROCEDURE">Procedure</SelectItem>
                    <SelectItem value="FORM">Form</SelectItem>
                    <SelectItem value="POLICY">Policy</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docno">Document Code</Label>
                <Input
                  id="docno"
                  value={formData.docno}
                  onChange={(e) => handleInputChange('docno', e.target.value)}
                  placeholder="Enter document code"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="docna">Document Name</Label>
                <Input
                  id="docna"
                  value={formData.docna}
                  onChange={(e) => handleInputChange('docna', e.target.value)}
                  placeholder="Enter document name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="docver">Version</Label>
                <Input
                  id="docver"
                  value={formData.docver}
                  onChange={(e) => handleInputChange('docver', e.target.value)}
                  placeholder="Enter version (e.g., 1.0)"
                  required
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="office-file">Office File</Label>
                <Input
                  id="office-file"
                  type="file"
                  accept=".docx,.xlsx"
                  onChange={(e) => handleFileChange(e, 'office')}
                />
                {formData.docfile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {formData.docfile.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Allowed: .docx, .xlsx (max 10MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf-file">PDF File</Label>
                <Input
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'pdf')}
                />
                {formData.docfilepdf && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {formData.docfilepdf.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Allowed: .pdf (max 10MB)
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            {isUploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-center text-sm font-medium mt-2">
                  Uploading... {uploadProgress}%
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToDocuments}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !canUpload}>
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
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
          <CardTitle>File Guidelines</CardTitle>
          <CardDescription>
            Please follow these file requirements for successful uploads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-2">
            <li>Maximum file size: 10MB per file</li>
            <li>Allowed Office files: .docx, .xlsx</li>
            <li>Allowed PDF files: .pdf only</li>
            <li>
              Recommended file naming: Use descriptive names (e.g.,
              "Employee-Onboarding-Manual-v1.0.docx")
            </li>
            <li>Large files may take longer to upload</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentUploadPage;
