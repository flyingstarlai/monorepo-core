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
  dockind: string;
  docno: string;
  docna: string;
  docver: string;
  docfile?: string;
  docfilepdf?: string;
  docCreator: string;
  docCreate: string;
  docModifier?: string;
  docModiDate?: string;
  docLoader?: string;
  docLoaderDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentDto {
  dockind: string; // Change from enum to string to support dynamic kinds
  docno: string;
  docna: string;
  docver: string;
  docfile?: File;
  docfilepdf?: File;
}

export interface ListDocumentsDto {
  dockind?: string; // Support string for dynamic kinds
  search?: string;
}
