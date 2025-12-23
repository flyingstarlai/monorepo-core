import { DocumentKind } from '../types/documents.types';

/**
 * Type guard to check if a value is a valid DocumentKind
 */
export function isValidDocumentKind(value: string): value is DocumentKind {
  // Check if value matches any of known enum values
  // This will support dynamic document kinds
  const validKinds = ['PROCEDURE', 'FORM', 'POLICY', 'MANUAL', 'OTHER'];
  return validKinds.includes(value);
}

/**
 * Convert string to DocumentKind with validation
 */
export function toDocumentKind(value: string): DocumentKind | undefined {
  // Return value as is if it's valid
  return isValidDocumentKind(value) ? (value as DocumentKind) : undefined;
}

/**
 * Get display label for DocumentKind (will fetch from API)
 */
export function getDocumentKindLabel(
  kind: DocumentKind,
  fallbackLabel?: string,
): string {
  // For now, use fallback labels for static ones, but this should come from API
  const staticLabels: Record<string, string> = {
    PROCEDURE: '程序',
    FORM: '表單',
    POLICY: '政策',
    MANUAL: '手冊',
    OTHER: '其他',
  };
  return fallbackLabel || staticLabels[kind] || kind;
}

/**
 * Get all DocumentKind options for select components (will fetch from API)
 */
export async function getDocumentKindOptions(): Promise<
  Array<{
    value: string;
    label: string;
    isActive: boolean;
  }>
> {
  // This should fetch from API, but for now return static options
  try {
    // Mock API call - replace with real API call
    const response = await fetch('/api/document-kinds');
    const kinds = await response.json();

    return kinds.map((kind: any) => ({
      value: kind.code,
      label: kind.name,
      isActive: kind.isActive,
    }));
  } catch (error) {
    console.error('Failed to fetch document kinds:', error);
    // Return fallback options
    const staticKinds = [
      { value: 'PROCEDURE', label: '程序' },
      { value: 'FORM', label: '表單' },
      { value: 'POLICY', label: '政策' },
      { value: 'MANUAL', label: '手冊' },
      { value: 'OTHER', label: '其他' },
    ];

    return staticKinds.map((kind) => ({
      ...kind,
      isActive: true,
    }));
  }
}

export interface DocumentFormData {
  dockind: string;
  docno: string;
  docna: string;
  docver: string;
}

export interface DocumentValidationError {
  field: keyof DocumentFormData;
  message: string;
}

/**
 * Validate document form data
 */
export function validateDocumentFormData(
  data: DocumentFormData,
): DocumentValidationError[] {
  const errors: DocumentValidationError[] = [];

  if (!data.dockind) {
    errors.push({ field: 'dockind', message: 'Document kind is required' });
  } else if (!isValidDocumentKind(data.dockind)) {
    errors.push({
      field: 'dockind',
      message: 'Invalid document kind. Please select from available options.',
    });
  }

  if (!data.docno) {
    errors.push({ field: 'docno', message: 'Document number is required' });
  }

  if (!data.docna) {
    errors.push({ field: 'docna', message: 'Document name is required' });
  }

  if (!data.docver) {
    errors.push({ field: 'docver', message: 'Document version is required' });
  }

  return errors;
}

/**
 * Format error messages for display
 */
export function formatDocumentValidationErrors(
  errors: DocumentValidationError[],
): string[] {
  return errors.map((error) => `${error.field}: ${error.message}`);
}
