export interface DocumentResponseDto {
  id: string;
  documentKind: string;
  documentNumber: string;
  documentName: string;
  version: string;
  documentAccessLevel: number;
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
  documentKind: string;
  documentNumber: string;
  documentName: string;
  version: string;
  documentAccessLevel?: number;
  officeFile?: File;
  pdfFile?: File;
}

export interface ListDocumentsDto {
  documentKind?: string;
  search?: string;
}

export interface OnlyofficeConfigDto {
  documentServerUrl: string;
  config: any;
}
