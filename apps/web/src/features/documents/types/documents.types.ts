export enum DocumentKind {
  PROCEDURE = 'PROCEDURE',
  FORM = 'FORM',
  POLICY = 'POLICY',
  MANUAL = 'MANUAL',
  OTHER = 'OTHER',
}

export interface DocumentKindDto {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DocumentResponseDto {
  id: number;
  documentKindCode: string;
  documentNumber: string;
  documentName: string;
  version: string;
  officeFilePath?: string;
  pdfFilePath?: string;
  createdBy: string;
  createdAtUser: string;
  modifiedBy?: string;
  modifiedAtUser?: string;
  downloadedBy?: string;
  downloadedAtUser?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentDto {
  documentKindCode: string;
  documentNumber: string;
  documentName: string;
  version: string;
  officeFile?: File;
  pdfFile?: File;
}

export interface ListDocumentsDto {
  documentKindCode?: string;
  search?: string;
}

export interface ListDocumentsDto {
  dockind?: string; // Support string for dynamic kinds
  search?: string;
}
