export enum FileType {
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PDF = 'pdf',
}

export const ALLOWED_FILE_TYPES: string[] = [
  FileType.DOC,
  FileType.DOCX,
  FileType.XLS,
  FileType.XLSX,
  FileType.PDF,
];

export const ALLOWED_MIME_TYPES: string[] = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
];
