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

export interface UpdateDocumentDto {
  documentKind?: string;
  documentNumber?: string;
  documentName?: string;
  version?: string;
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

export interface DocumentsQuery {
  documentKind?: string;
  search?: string;
  stageId?: string;
}

export interface OnlyofficeConfigDto {
  documentServerUrl: string;
  config: OnlyOfficeConfig;
  token?: string;
}

export interface OnlyOfficeConfig {
  documentType: 'word' | 'cell' | 'slide' | 'pdf';
  document: OnlyOfficeDocumentConfig;
  editorConfig: OnlyOfficeEditorConfig;
  token?: string;
}

export interface OnlyOfficeDocumentConfig {
  fileType: string;
  key: string;
  title: string;
  url: string;
  permissions: {
    edit: boolean;
    comment: boolean;
    download: boolean;
    print: boolean;
    fillForms: boolean;
    modifyFilter: boolean;
    modifyContentControl: boolean;
    review: boolean;
  };
}

export interface OnlyOfficeEditorConfig {
  mode: 'edit' | 'view';
  lang: string;
  callbackUrl: string;
  user: {
    id: string;
    name: string;
    role: string;
    canEdit: boolean;
  };
  customization: {
    autosave: boolean;
    forcesave: boolean;
    forcesavetype: string;
    hideMenu?: boolean;
    hideToolbar?: boolean;
    hideRulers?: boolean;
    toolbarNoTabs?: boolean;
    toolbarHideFileName?: boolean;
  };
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
