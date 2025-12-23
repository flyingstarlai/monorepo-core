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
  docfile?: File;
  docfilepdf?: File;
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
    dockind: DocumentKind.PROCEDURE,
    docno: 'PROC-001',
    docna: 'Onboarding Procedure',
    docver: '1.0',
    docfile: 'documents/PROCEDURE/1/office/proc-001.docx',
    docfilepdf: 'documents/PROCEDURE/1/pdf/proc-001.pdf',
    docCreator: 'admin',
    docCreate: '2024-01-01',
    docModifier: 'admin',
    docModiDate: '2024-02-10',
    docLoader: 'manager',
    docLoaderDate: '2024-02-15',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 2,
    dockind: DocumentKind.FORM,
    docno: 'FORM-010',
    docna: 'Expense Claim Form',
    docver: '2.3',
    docfile: 'documents/FORM/2/office/form-010.docx',
    docfilepdf: 'documents/FORM/2/pdf/form-010.pdf',
    docCreator: 'manager',
    docCreate: '2024-03-05',
    docModifier: 'finance',
    docModiDate: '2024-03-12',
    docLoader: 'staff',
    docLoaderDate: '2024-03-20',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-12'),
  },
];

function simulateDelay<T>(value: T, delay = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}

function matchesQuery(doc: DocumentResponseDto, query?: ListDocumentsDto) {
  if (!query) return true;
  const matchesKind = query.dockind ? doc.dockind === query.dockind : true;
  const matchesSearch = query.search
    ? doc.docno.toLowerCase().includes(query.search.toLowerCase()) ||
      doc.docna.toLowerCase().includes(query.search.toLowerCase())
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
      dockind: data.dockind,
      docno: data.docno,
      docna: data.docna,
      docver: data.docver,
      docfile: data.docfile?.name,
      docfilepdf: data.docfilepdf?.name,
      docCreator: data.createdBy ? String(data.createdBy) : 'system',
      docCreate: new Date().toISOString(),
      docModifier: undefined,
      docModiDate: undefined,
      docLoader: undefined,
      docLoaderDate: undefined,
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
      docfile: officeFile,
      docfilepdf: pdfFile,
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
