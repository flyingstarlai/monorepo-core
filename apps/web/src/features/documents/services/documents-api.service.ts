import { DocumentKind } from '../types/documents.types';
import type {
  DocumentKindDto,
  DocumentResponseDto,
  CreateDocumentDto,
  ListDocumentsDto,
} from '../types/documents.types';

// Allowed file types shared with upload page
export const ALLOWED_OFFICE_FILE_TYPES = ['.docx', '.xlsx'];
export const ALLOWED_PDF_FILE_TYPES = ['.pdf'];

// Simple console logger for development
class Logger {
  constructor(private context: string) {}

  log(message: string, payload?: unknown) {
    if (payload === undefined) {
      console.log(`[${this.context}] ${message}`);
      return;
    }
    console.log(`[${this.context}] ${message}`, payload);
  }

  error(message: string, error?: unknown) {
    console.error(`[${this.context}] ${message}`, error);
  }
}

interface DocumentUploadPayload extends CreateDocumentDto {
  officeFile?: File;
  pdfFile?: File;
  createdBy?: number | string;
}

// Mock in-memory data
let documentIdCounter = 3;
let documentKindIdCounter = 5;

const mockDocumentKinds: DocumentKindDto[] = [
  {
    id: 1,
    code: DocumentKind.PROCEDURE,
    name: '程序',
    description: 'Standard operating procedures',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    code: DocumentKind.FORM,
    name: '表單',
    description: 'Company forms',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    code: DocumentKind.POLICY,
    name: '政策',
    description: 'Policies and guidelines',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockDocuments: DocumentResponseDto[] = [
  {
    id: 1,
    documentKindCode: DocumentKind.PROCEDURE,
    documentNumber: 'PROC-001',
    documentName: 'Onboarding Procedure',
    version: '1.0',
    officeFilePath: 'documents/PROCEDURE/1/office/proc-001.docx',
    pdfFilePath: 'documents/PROCEDURE/1/pdf/proc-001.pdf',
    createdBy: 'admin',
    createdAtUser: '2024-01-01',
    modifiedBy: 'admin',
    modifiedAtUser: '2024-02-10',
    downloadedBy: 'manager',
    downloadedAtUser: '2024-02-15',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 2,
    documentKindCode: DocumentKind.FORM,
    documentNumber: 'FORM-010',
    documentName: 'Expense Claim Form',
    version: '2.3',
    officeFilePath: 'documents/FORM/2/office/form-010.docx',
    pdfFilePath: 'documents/FORM/2/pdf/form-010.pdf',
    createdBy: 'manager',
    createdAtUser: '2024-03-05',
    modifiedBy: 'finance',
    modifiedAtUser: '2024-03-12',
    downloadedBy: 'staff',
    downloadedAtUser: '2024-03-20',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-12'),
  },
];

function simulateDelay<T>(value: T, delay = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}

function matchesQuery(doc: DocumentResponseDto, query?: ListDocumentsDto) {
  if (!query) return true;
  const matchesKind = query.documentKindCode
    ? doc.documentKindCode === query.documentKindCode
    : true;
  const matchesSearch = query.search
    ? doc.documentNumber.toLowerCase().includes(query.search.toLowerCase()) ||
      doc.documentName.toLowerCase().includes(query.search.toLowerCase())
    : true;
  return matchesKind && matchesSearch;
}

export class DocumentsApiService {
  private readonly logger = new Logger(DocumentsApiService.name);

  async getDocuments(query?: ListDocumentsDto): Promise<DocumentResponseDto[]> {
    this.logger.log(`Getting documents with query: ${JSON.stringify(query)}`);
    const docs = mockDocuments.filter((doc) => matchesQuery(doc, query));
    return simulateDelay(docs);
  }

  async getDocumentKinds(): Promise<DocumentKindDto[]> {
    this.logger.log('Getting document kinds');
    const kinds = [...mockDocumentKinds].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
    return simulateDelay(kinds);
  }

  async createDocument(
    data: DocumentUploadPayload,
  ): Promise<DocumentResponseDto> {
    this.logger.log('Creating document', data);
    documentIdCounter += 1;
    const newDoc: DocumentResponseDto = {
      id: documentIdCounter,
      documentKindCode: data.documentKindCode,
      documentNumber: data.documentNumber,
      documentName: data.documentName,
      version: data.version,
      officeFilePath: data.officeFile?.name,
      pdfFilePath: data.pdfFile?.name,
      createdBy: data.createdBy ? String(data.createdBy) : 'system',
      createdAtUser: new Date().toISOString(),
      modifiedBy: undefined,
      modifiedAtUser: undefined,
      downloadedBy: undefined,
      downloadedAtUser: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as DocumentResponseDto;
    mockDocuments.unshift(newDoc);
    return simulateDelay(newDoc);
  }

  async updateDocument(
    id: number,
    data: Partial<DocumentUploadPayload>,
  ): Promise<DocumentResponseDto> {
    this.logger.log(`Updating document ${id}`, data);
    const docIndex = mockDocuments.findIndex((doc) => doc.id === id);
    if (docIndex === -1) {
      throw new Error('Document not found');
    }
    const updated: DocumentResponseDto = {
      ...mockDocuments[docIndex],
      ...data,
      updatedAt: new Date(),
    } as DocumentResponseDto;
    mockDocuments[docIndex] = updated;
    return simulateDelay(updated);
  }

  async deleteDocument(id: number): Promise<void> {
    this.logger.log(`Deleting document ${id}`);
    const index = mockDocuments.findIndex((doc) => doc.id === id);
    if (index !== -1) {
      mockDocuments.splice(index, 1);
    }
    await simulateDelay(undefined);
  }

  async downloadDocument(id: number, type: 'office' | 'pdf'): Promise<Blob> {
    this.logger.log(`Downloading ${type} document for ID ${id}`);
    const content = `Sample ${type.toUpperCase()} content for document ${id}`;
    const mimeType =
      type === 'office'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf';
    return simulateDelay(new Blob([content], { type: mimeType }));
  }

  async createDocumentKind(
    data: DocumentKindFormData,
  ): Promise<DocumentKindDto> {
    documentKindIdCounter += 1;
    const newKind: DocumentKindDto = {
      id: documentKindIdCounter,
      code: data.code as DocumentKind,
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? documentKindIdCounter,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDocumentKinds.push(newKind);
    return simulateDelay(newKind);
  }

  async updateDocumentKind(
    id: number,
    data: Partial<DocumentKindFormData>,
  ): Promise<DocumentKindDto> {
    const index = mockDocumentKinds.findIndex((kind) => kind.id === id);
    if (index === -1) throw new Error('Document kind not found');
    const updated: DocumentKindDto = {
      ...mockDocumentKinds[index],
      ...data,
      updatedAt: new Date(),
    } as DocumentKindDto;
    mockDocumentKinds[index] = updated;
    return simulateDelay(updated);
  }

  async deleteDocumentKind(id: number): Promise<void> {
    const index = mockDocumentKinds.findIndex((kind) => kind.id === id);
    if (index !== -1) {
      mockDocumentKinds.splice(index, 1);
    }
    await simulateDelay(undefined);
  }

  async toggleDocumentKindActive(id: number): Promise<DocumentKindDto> {
    const index = mockDocumentKinds.findIndex((kind) => kind.id === id);
    if (index === -1) throw new Error('Document kind not found');

    const existingKind = mockDocumentKinds[index];
    if (!existingKind) throw new Error('Document kind not found');

    const updatedKind: DocumentKindDto = {
      ...existingKind,
      isActive: !existingKind.isActive,
      updatedAt: new Date(),
    };

    mockDocumentKinds[index] = updatedKind;
    return simulateDelay(updatedKind);
  }

  validateFile(
    file: File,
    allowedExtensions: string[],
  ): { isValid: boolean; error?: string } {
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File type ${extension} is not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
      };
    }
    const maxSizeMb = 25;
    if (file.size > maxSizeMb * 1024 * 1024) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMb}MB limit`,
      };
    }
    return { isValid: true };
  }

  prepareDocumentFormData(
    metadata: CreateDocumentDto,
    officeFile?: File,
    pdfFile?: File,
    createdBy?: number | string,
  ): DocumentUploadPayload {
    return {
      ...metadata,
      officeFile,
      pdfFile,
      createdBy,
    };
  }
}

export interface DocumentKindFormData {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export const documentsApi = new DocumentsApiService();
