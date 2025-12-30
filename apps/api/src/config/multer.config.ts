import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { Request } from 'express';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

const UPLOAD_DEST = process.env.UPLOAD_DEST_DIR || './uploads/documents';
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760');

const allowedMimeTypes = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.ms-excel',
  'application/pdf',
];

const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.pdf'];

const getFileName = (
  req: Request,
  file: MulterFile,
  cb: (error: Error | null, filename: string) => void,
) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  cb(null, `${uniqueSuffix}${ext}`);
};

const fileFilter = (
  req: Request,
  file: MulterFile,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`,
      ),
      false,
    );
  }
};

const ensureUploadDirExists = () => {
  if (!existsSync(UPLOAD_DEST)) {
    mkdirSync(UPLOAD_DEST, { recursive: true });
  }
};

ensureUploadDirExists();

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DEST);
    },
    filename: getFileName,
  }),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};

export const getDocumentFilePath = (
  documentId: string,
  kind: string,
  fileType: 'office' | 'pdf',
  filename: string,
): string => {
  return `${kind.toLowerCase()}/${documentId}/${fileType}/${filename}`;
};

export const UPLOAD_DEST_DIR = UPLOAD_DEST;
export const UPLOAD_MAX_FILE_SIZE = MAX_FILE_SIZE;
