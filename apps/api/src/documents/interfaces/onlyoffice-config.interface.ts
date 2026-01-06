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
