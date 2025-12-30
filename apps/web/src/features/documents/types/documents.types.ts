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
  stageId: string;
  stage?: DocumentStage;
  stageOptions: DocumentStage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentDto {
  documentKind: string;
  documentNumber: string;
  documentName: string;
  version: string;
  documentAccessLevel?: number;
  stageId?: string;
  officeFile?: File;
  pdfFile?: File;
}

export interface ListDocumentsDto {
  documentKind?: string;
  search?: string;
  stageId?: string;
}

export interface OnlyofficeConfigDto {
  documentServerUrl: string;
  config: any;
}

export interface ConversionStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  error?: string;
  createdAt: string;
}

export interface DocumentStage {
  id: string;
  title: string;
  sortOrder: number;
  documentCount?: number;
}

export interface CreateDocumentStage {
  title: string;
  sortOrder: number;
}

export interface UpdateDocumentStage {
  title?: string;
  sortOrder?: number;
}
