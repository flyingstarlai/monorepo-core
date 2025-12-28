import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentsEntity } from './entities';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { OnlyofficeCallbackDto } from './dto/onlyoffice-callback.dto';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { formatDateUTC8 } from '../utils/date-formatter';
import { User } from '../users/entities/user.entity';
import { IdGenerator } from '../utils/id-generator';
import {
  existsSync,
  unlinkSync,
  mkdirSync,
  renameSync,
  createReadStream,
  createWriteStream,
  statSync,
  readdirSync,
} from 'fs';
import { join } from 'path';
import { UPLOAD_DEST_DIR, getDocumentFilePath } from '../config/multer.config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

type MulterFile = Express.Multer.File;

interface OnlyOfficeEditorConfig {
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
  };
}

interface OnlyOfficeDocumentConfig {
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

interface OnlyOfficeConfig {
  documentType: 'word' | 'cell' | 'slide' | 'pdf';
  document: OnlyOfficeDocumentConfig;
  editorConfig: OnlyOfficeEditorConfig;
}

interface ConversionJob {
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  error?: string;
  createdAt: Date;
  user?: User;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private conversionJobs = new Map<string, ConversionJob>();

  constructor(
    @InjectRepository(DocumentsEntity)
    private readonly documentsRepository: Repository<DocumentsEntity>,
  ) {
    this.cleanupExpiredPdfs();
  }

  async initiatePdfConversion(documentId: string, user: User): Promise<string> {
    this.logger.log(`Initiating PDF conversion for document ${documentId}`);

    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canAccessDocument(document, user)) {
      throw new ForbiddenException('You do not have access to this document');
    }

    if (!document.officeFilePath) {
      throw new NotFoundException('Office file not found for this document');
    }

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const [jobId, job] of this.conversionJobs.entries()) {
      if (
        job.documentId === documentId &&
        job.createdAt.getTime() > oneHourAgo
      ) {
        if (job.status === 'completed') {
          this.logger.log(
            `Returning existing completed conversion job ${jobId}`,
          );
          return jobId;
        }
      }
    }

    const jobId = `${documentId}_${Date.now()}`;
    const newJob: ConversionJob = {
      documentId,
      status: 'pending',
      createdAt: new Date(),
      user,
    };

    this.conversionJobs.set(jobId, newJob);
    this.logger.log(
      `Created conversion job ${jobId} for document ${documentId}`,
    );

    setImmediate(() => this.processConversionJob(jobId));

    return jobId;
  }

  private async processConversionJob(jobId: string): Promise<void> {
    this.logger.log(`Processing conversion job ${jobId}`);

    const job = this.conversionJobs.get(jobId);
    if (!job) {
      this.logger.warn(`Job ${jobId} not found`);
      return;
    }

    job.status = 'processing';

    try {
      const document = await this.documentsRepository.findOne({
        where: { id: job.documentId },
      });

      if (!document || !document.officeFilePath) {
        throw new Error('Document or office file not found');
      }

      const fileExt =
        document.officeFilePath.split('.').pop()?.toLowerCase() || '';
      const documentUrl = `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost:3000'}/documents/${document.id}/download?type=office`;

      const conversionPayload: Record<string, unknown> = {
        async: false,
        filetype: fileExt,
        key: `${document.id}_${Date.now()}`,
        outputtype: 'pdf',
        url: documentUrl,
        title: `${document.documentNumber || document.id}.pdf`,
      };

      const secret = process.env.ONLYOFFICE_JWT_SECRET;
      if (secret) {
        const token = jwt.sign(conversionPayload, secret, {
          algorithm: 'HS256',
          expiresIn: '30m',
        });
        conversionPayload.token = token;
      }

      const onlyofficeUrl = process.env.ONLYOFFICE_DOCUMENT_SERVER_URL;
      if (!onlyofficeUrl) {
        throw new Error('OnlyOffice Document Server is not configured');
      }

      this.logger.log(
        `Sending conversion request to OnlyOffice: ${onlyofficeUrl}/converter`,
      );

      const response = await axios.post(
        `${onlyofficeUrl}/converter`,
        conversionPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        },
      );

      const {
        error: conversionError,
        endConvert,
        fileUrl,
      } = response.data || {};

      if (typeof conversionError === 'number') {
        if (conversionError !== 0) {
          throw new Error(
            `OnlyOffice conversion failed with code ${conversionError}`,
          );
        }
      } else if (conversionError) {
        throw new Error(`OnlyOffice conversion failed: ${conversionError}`);
      }

      if (!fileUrl) {
        throw new Error(
          `OnlyOffice conversion did not return a fileUrl (endConvert=${endConvert})`,
        );
      }

      const pdfUrl = String(fileUrl);
      this.logger.log(`OnlyOffice returned PDF URL: ${pdfUrl}`);

      const pdfResponse = await axios.get(pdfUrl as string, {
        responseType: 'arraybuffer',
        timeout: 300000,
      });

      const pdfDir = join(
        UPLOAD_DEST_DIR,
        document.documentKind.toLowerCase(),
        document.id,
        'pdf',
      );
      this.ensureDirectoryExists(pdfDir);

      const pdfFilePath = join(pdfDir, `${document.id}.pdf`);
      const writeStream = createWriteStream(pdfFilePath);

      await new Promise<void>((resolve, reject) => {
        writeStream.write(Buffer.from(pdfResponse.data), (err) => {
          if (err) {
            reject(err);
            return;
          }
          writeStream.end(() => {
            this.logger.log(`PDF saved to: ${pdfFilePath}`);
            resolve();
          });
        });
      });

      const relativePdfPath = join(
        document.documentKind.toLowerCase(),
        document.id,
        'pdf',
        `${document.id}.pdf`,
      );

      job.status = 'completed';
      job.pdfUrl = relativePdfPath;

      if (job.user) {
        const username = this.getUserDisplayName(job.user);
        await this.documentsRepository.update(document.id, {
          modifiedBy: username,
          modifiedAtUser: formatDateUTC8(new Date()),
        });
      }

      this.logger.log(`Conversion job ${jobId} completed successfully`);
    } catch (error) {
      this.logger.error(`Conversion job ${jobId} failed`, error);
      job.status = 'failed';
      job.error = error.message || 'Unknown error';
    }
  }

  getConversionStatus(jobId: string): ConversionJob | null {
    return this.conversionJobs.get(jobId) || null;
  }

  async downloadConvertedPdf(
    documentId: string,
    user: User,
  ): Promise<{
    stream: NodeJS.ReadableStream;
    contentType: string;
    fileName: string;
    fileSize?: number;
  }> {
    this.logger.log(
      `Download converted PDF request for document ${documentId}`,
    );

    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canAccessDocument(document, user)) {
      throw new ForbiddenException('You do not have access to this document');
    }

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // 1. If there is a recent completed job in memory, use its PDF
    for (const [, job] of this.conversionJobs.entries()) {
      if (
        job.documentId === documentId &&
        job.createdAt.getTime() > oneHourAgo &&
        job.status === 'completed' &&
        job.pdfUrl
      ) {
        const absolutePath = join(UPLOAD_DEST_DIR, job.pdfUrl);

        if (existsSync(absolutePath)) {
          await this.recordDownload(documentId, user);
          const stats = statSync(absolutePath);

          return {
            stream: createReadStream(absolutePath),
            contentType: 'application/pdf',
            fileName: `${document.documentNumber || document.id}.pdf`,
            fileSize: stats.size,
          };
        }
      }
    }

    // 2. If the document already has a stored PDF path, use it
    if (document.pdfFilePath) {
      const absolutePath = join(UPLOAD_DEST_DIR, document.pdfFilePath);
      if (existsSync(absolutePath)) {
        await this.recordDownload(documentId, user);
        const stats = statSync(absolutePath);

        return {
          stream: createReadStream(absolutePath),
          contentType: 'application/pdf',
          fileName: `${document.documentNumber || document.id}.pdf`,
          fileSize: stats.size,
        };
      }
    }

    // 3. Otherwise perform a synchronous conversion now
    const jobId = `${documentId}_${Date.now()}`;
    const job: ConversionJob = {
      documentId,
      status: 'pending',
      createdAt: new Date(),
      user,
    };

    this.conversionJobs.set(jobId, job);
    this.logger.log(
      `Created synchronous conversion job ${jobId} for document ${documentId}`,
    );

    await this.processConversionJob(jobId);

    const finishedJob = this.conversionJobs.get(jobId);

    if (
      !finishedJob ||
      finishedJob.status !== 'completed' ||
      !finishedJob.pdfUrl
    ) {
      this.logger.error(
        `Synchronous conversion job ${jobId} failed for document ${documentId}: ${
          finishedJob?.error || 'Unknown error'
        }`,
      );
      throw new InternalServerErrorException(
        'Failed to convert document to PDF',
      );
    }

    const absolutePdfPath = join(UPLOAD_DEST_DIR, finishedJob.pdfUrl);

    if (!existsSync(absolutePdfPath)) {
      this.logger.error(
        `Converted PDF not found on disk after job ${jobId}: ${absolutePdfPath}`,
      );
      throw new InternalServerErrorException('Converted PDF not found on disk');
    }

    await this.recordDownload(documentId, user);
    const stats = statSync(absolutePdfPath);

    return {
      stream: createReadStream(absolutePdfPath),
      contentType: 'application/pdf',
      fileName: `${document.documentNumber || document.id}.pdf`,
      fileSize: stats.size,
    };
  }

  private cleanupExpiredPdfs(): void {
    this.logger.log('Starting cleanup of expired PDFs (30-day TTL)');

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let cleanedCount = 0;

    try {
      const uploadsDir = join(UPLOAD_DEST_DIR);
      const kinds = ['general', 'policy', 'manual', 'other'];

      for (const kind of kinds) {
        const kindDir = join(uploadsDir, kind);

        if (!existsSync(kindDir)) continue;

        const docIds = readdirSync(kindDir);

        for (const docId of docIds) {
          const pdfDir = join(kindDir, docId, 'pdf');

          if (!existsSync(pdfDir)) continue;

          try {
            const pdfFiles = readdirSync(pdfDir);

            for (const pdfFile of pdfFiles) {
              const pdfFilePath = join(pdfDir, pdfFile);
              const stats = statSync(pdfFilePath);

              if (stats.mtimeMs < thirtyDaysAgo) {
                unlinkSync(pdfFilePath);
                cleanedCount++;
                this.logger.log(`Deleted expired PDF: ${pdfFilePath}`);
              }
            }
          } catch (error) {
            this.logger.warn(`Error processing directory ${pdfDir}:`, error);
          }
        }
      }

      this.logger.log(`PDF cleanup completed: ${cleanedCount} files deleted`);
    } catch (error) {
      this.logger.error('Error during PDF cleanup', error);
    }
  }

  async findAll(
    query: ListDocumentsDto,
    user: User,
  ): Promise<DocumentResponseDto[]> {
    const qb = this.documentsRepository.createQueryBuilder('document');
    const accessLevel = this.getUserAccessLevel(user);

    qb.where('document.documentAccessLevel <= :accessLevel', { accessLevel });

    if (query?.documentKind) {
      qb.andWhere('LOWER(document.documentKind) = LOWER(:kind)', {
        kind: query.documentKind,
      });
    }

    if (query?.search) {
      const searchTerm = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(document.documentName) LIKE :search OR LOWER(document.documentNumber) LIKE :search)',
        { search: searchTerm },
      );
    }

    qb.orderBy('document.createdAt', 'DESC');

    const documents = await qb.getMany();
    return documents.map((document) => this.mapToResponse(document));
  }

  async findOne(id: string, user: User): Promise<DocumentResponseDto> {
    const document = await this.documentsRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canAccessDocument(document, user)) {
      throw new ForbiddenException('You do not have access to this document');
    }

    return this.mapToResponse(document);
  }

  async createWithFiles(
    createDocumentDto: CreateDocumentDto,
    user: User,
    officeFile?: MulterFile,
    pdfFile?: MulterFile,
  ): Promise<DocumentResponseDto> {
    const documentId = IdGenerator.generateDocumentId();
    const username = this.getUserDisplayName(user);
    const timestamp = formatDateUTC8(new Date());

    const document = this.documentsRepository.create({
      ...createDocumentDto,
      id: documentId,
      documentAccessLevel: createDocumentDto.documentAccessLevel ?? 1,
      createdBy: username,
      createdAtUser: timestamp,
      modifiedBy: username,
      modifiedAtUser: timestamp,
    });

    try {
      if (officeFile) {
        document.officeFilePath = this.storeUploadedFile(
          documentId,
          document.documentKind,
          'office',
          officeFile,
        );
      }

      if (pdfFile) {
        document.pdfFilePath = this.storeUploadedFile(
          documentId,
          document.documentKind,
          'pdf',
          pdfFile,
        );
      }

      const savedDocument = await this.documentsRepository.save(document);
      return this.mapToResponse(savedDocument);
    } catch (error) {
      this.logger.error('Failed to create document', error);
      this.cleanupUploadedFiles([
        document.officeFilePath,
        document.pdfFilePath,
      ]);
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  async updateWithFiles(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    user: User,
    officeFile?: MulterFile,
    pdfFile?: MulterFile,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canAccessDocument(document, user)) {
      throw new ForbiddenException('You do not have access to this document');
    }

    Object.assign(document, {
      ...updateDocumentDto,
      documentAccessLevel:
        updateDocumentDto.documentAccessLevel ?? document.documentAccessLevel,
      modifiedBy: this.getUserDisplayName(user),
      modifiedAtUser: formatDateUTC8(new Date()),
    });

    try {
      if (officeFile) {
        this.deleteFileIfExists(document.officeFilePath);
        document.officeFilePath = this.storeUploadedFile(
          document.id,
          document.documentKind,
          'office',
          officeFile,
        );
      }

      if (pdfFile) {
        this.deleteFileIfExists(document.pdfFilePath);
        document.pdfFilePath = this.storeUploadedFile(
          document.id,
          document.documentKind,
          'pdf',
          pdfFile,
        );
      }

      const savedDocument = await this.documentsRepository.save(document);
      return this.mapToResponse(savedDocument);
    } catch (error) {
      this.logger.error(`Failed to update document ${id}`, error);
      throw new InternalServerErrorException('Failed to update document');
    }
  }

  async remove(id: string, user: User): Promise<void> {
    const document = await this.documentsRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canAccessDocument(document, user)) {
      throw new ForbiddenException('You do not have access to this document');
    }

    await this.documentsRepository.delete(id);
    this.cleanupUploadedFiles([document.officeFilePath, document.pdfFilePath]);
  }

  async getFileStream(
    id: string,
    type: 'office' | 'pdf',
    user: User | null,
    options?: { bypassAccessCheck?: boolean },
  ): Promise<{
    stream: NodeJS.ReadableStream;
    contentType: string;
    fileName: string;
    fileSize?: number;
  }> {
    const bypassAccessCheck = options?.bypassAccessCheck ?? false;

    this.logger.log('=== GET FILE STREAM START ===');
    this.logger.log(`Document ID: ${id}, Type: ${type}`);
    this.logger.log(
      `User: ${user ? `${user.id} (${user.username})` : 'OnlyOffice system request'}`,
    );
    this.logger.log(`Bypass access check: ${bypassAccessCheck}`);

    const document = await this.documentsRepository.findOne({ where: { id } });

    if (!document) {
      this.logger.warn(`Document not found: ${id}`);
      throw new NotFoundException('Document not found');
    }

    if (!bypassAccessCheck) {
      if (!user) {
        this.logger.warn(`Missing user for document ${id} access check`);
        throw new ForbiddenException('User not authenticated');
      }

      if (!this.canAccessDocument(document, user)) {
        this.logger.warn(`Access denied for user ${user.id} to document ${id}`);
        throw new ForbiddenException('You do not have access to this document');
      }
    }

    const filePath =
      type === 'office' ? document.officeFilePath : document.pdfFilePath;

    if (!filePath) {
      this.logger.warn(`No ${type} file path for document ${id}`);
      throw new NotFoundException('Requested file does not exist');
    }

    const absolutePath = join(UPLOAD_DEST_DIR, filePath);
    this.logger.log(`Absolute file path: ${absolutePath}`);

    if (!existsSync(absolutePath)) {
      this.logger.error(`File not found on disk: ${absolutePath}`);
      throw new NotFoundException('File not found on disk');
    }

    this.logger.log('File exists on disk, creating stream...');

    const stats = statSync(absolutePath);
    const stream = createReadStream(absolutePath);
    const contentType = this.getContentType(filePath);
    const fileName = filePath.split('/').pop() || `${document.id}.${type}`;

    this.logger.log(
      `Stream created. Content-Type: ${contentType}, Filename: ${fileName}, Size: ${stats.size} bytes`,
    );

    return { stream, contentType, fileName, fileSize: stats.size };
  }

  async recordDownload(id: string, user: User): Promise<void> {
    const username = this.getUserDisplayName(user);

    await this.documentsRepository.update(id, {
      downloadedBy: username,
      downloadedAtUser: formatDateUTC8(new Date()),
    });
  }

  async handleOnlyOfficeCallback(
    id: string,
    callbackData: OnlyofficeCallbackDto,
  ): Promise<void> {
    this.logger.log(
      `Handling OnlyOffice callback for document ID: ${id}, action: ${callbackData.actions}`,
    );

    if (
      !callbackData ||
      (callbackData.actions !== 0 && callbackData.status !== 2)
    ) {
      this.logger.warn('Ignoring non-save callback');
      return;
    }

    const document = await this.documentsRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const updatedFileUrl = callbackData.url;
    if (!updatedFileUrl) {
      this.logger.warn('No URL in callback payload');
      return;
    }

    try {
      const response = await axios.get(updatedFileUrl, {
        responseType: 'arraybuffer',
      });

      const filePath = join(UPLOAD_DEST_DIR, document.officeFilePath);
      const writeStream = createWriteStream(filePath);

      await new Promise<void>((resolve, reject) => {
        writeStream.write(Buffer.from(response.data), (err) => {
          if (err) {
            reject(err);
            return;
          }
          writeStream.end(() => resolve());
        });
      });

      const documentDir = join(
        UPLOAD_DEST_DIR,
        document.documentKind.toLowerCase(),
        document.id,
      );
      const officeFileDir = join(documentDir, 'office');
      if (!existsSync(officeFileDir)) {
        mkdirSync(officeFileDir, { recursive: true });
      }
      const destPath = join(
        officeFileDir,
        document.officeFilePath.split('/').pop(),
      );

      const finalWriteStream = createWriteStream(destPath);

      await new Promise<void>((resolve, reject) => {
        finalWriteStream.write(Buffer.from(response.data), (err) => {
          if (err) {
            reject(err);
            return;
          }
          finalWriteStream.end(() => resolve());
        });
      });

      const currentUser = callbackData.users?.[0];
      const username = currentUser?.name || currentUser?.id || 'unknown';

      await this.documentsRepository.update(id, {
        modifiedBy: username,
        modifiedAtUser: formatDateUTC8(new Date()),
      });

      this.logger.log(`Document ${id} saved successfully by ${username}`);
    } catch (error) {
      this.logger.error(`Failed to save document ${id} from callback`, error);
      throw new InternalServerErrorException('Failed to save document');
    }
  }

  async getOnlyOfficeConfig(id: string, user: User): Promise<any> {
    this.logger.log('=== ONLYOFFICE CONFIG START ===');
    this.logger.log(`Document ID: ${id}`);
    this.logger.log(`User: ${user.id} (${user.username}), Role: ${user.role}`);

    const document = await this.documentsRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canAccessDocument(document, user)) {
      throw new ForbiddenException(
        'You do not have permission to access this document',
      );
    }

    if (!document.officeFilePath) {
      throw new NotFoundException('Office file not found for this document');
    }

    const canEdit = this.canEditDocument(user);

    const protocol = process.env.API_PROTOCOL || 'http';
    const host = process.env.API_HOST || 'localhost:3000';
    const documentUrl = `${protocol}://${host}/documents/${id}/download?type=office`;
    const callbackUrl = `${protocol}://${host}/documents/${id}/office/callback`;

    const fileExt = document.officeFilePath.split('.').pop()?.toLowerCase();
    let documentType: 'word' | 'cell' | 'slide' | 'pdf' = 'word';
    if (
      fileExt &&
      [
        'xls',
        'xlsx',
        'xlsm',
        'xlt',
        'xltm',
        'xltx',
        'csv',
        'ods',
        'ots',
        'fods',
      ].includes(fileExt)
    ) {
      documentType = 'cell';
    } else if (
      fileExt &&
      ['ppt', 'pptx', 'pps', 'ppsx', 'odp', 'otp'].includes(fileExt)
    ) {
      documentType = 'slide';
    } else if (fileExt && ['pdf', 'djvu', 'oxps', 'xps'].includes(fileExt)) {
      documentType = 'pdf';
    }

    const config: OnlyOfficeConfig = {
      documentType,
      document: {
        fileType:
          document.officeFilePath.split('.').pop()?.toLowerCase() || 'docx',
        key: `${document.id}_${document.updatedAt.getTime()}`,
        title: document.documentName || document.documentNumber,
        url: documentUrl,
        permissions: {
          edit: canEdit,
          comment: canEdit,
          download: canEdit,
          print: true,
          fillForms: canEdit,
          modifyFilter: canEdit,
          modifyContentControl: canEdit,
          review: canEdit,
        },
      },
      editorConfig: {
        mode: canEdit ? 'edit' : 'view',
        lang: 'zh-TW',
        callbackUrl,
        user: {
          id: user.id,
          name: user.fullName,
          role: user.role,
          canEdit,
        },
        customization: {
          autosave: true,
          forcesave: true,
          forcesavetype: 'update',
        },
      },
    };

    const token = await this.signOnlyOfficeConfig(config);
    (config as any).token = token;

    this.logger.log(
      `Generated OnlyOffice token (first 50 chars): ${token.substring(0, 50)}...`,
    );
    this.logger.log(`Document type: ${config.documentType}`);
    this.logger.log(`Document URL: ${config.document.url}`);
    this.logger.log(`Callback URL: ${config.editorConfig.callbackUrl}`);
    this.logger.log('=== ONLYOFFICE CONFIG END ===');

    return config;
  }

  private async signOnlyOfficeConfig(
    config: OnlyOfficeConfig | Record<string, unknown>,
  ): Promise<string> {
    try {
      const secret = process.env.ONLYOFFICE_JWT_SECRET;
      if (!secret) {
        throw new InternalServerErrorException(
          'OnlyOffice JWT secret not configured',
        );
      }
      return jwt.sign(config, secret, {
        algorithm: 'HS256',
        expiresIn: '30m',
      });
    } catch (error) {
      this.logger.error('Failed to sign OnlyOffice config', error);
      throw new InternalServerErrorException(
        'Failed to sign OnlyOffice config',
      );
    }
  }

  private getUserDisplayName(user: User): string {
    return user?.fullName || user?.username || user?.id || 'system';
  }

  private storeUploadedFile(
    documentId: string,
    documentKind: string,
    type: 'office' | 'pdf',
    file: MulterFile,
  ): string {
    const kind = documentKind || 'general';
    const relativePath = getDocumentFilePath(
      documentId,
      kind,
      type,
      file.filename,
    );
    const destinationDir = join(
      UPLOAD_DEST_DIR,
      kind.toLowerCase(),
      documentId,
      type,
    );
    const destinationPath = join(destinationDir, file.filename);

    this.ensureDirectoryExists(destinationDir);

    const sourcePath =
      file.path || join(file.destination || UPLOAD_DEST_DIR, file.filename);

    this.moveFile(sourcePath, destinationPath);

    return relativePath;
  }

  private cleanupUploadedFiles(paths: Array<string | undefined | null>): void {
    for (const filePath of paths) {
      this.deleteFileIfExists(filePath);
    }
  }

  private deleteFileIfExists(relativePath?: string | null): void {
    if (!relativePath) {
      return;
    }

    const absolutePath = join(UPLOAD_DEST_DIR, relativePath);
    if (existsSync(absolutePath)) {
      try {
        unlinkSync(absolutePath);
      } catch (error) {
        this.logger.warn(`Failed to delete file at ${absolutePath}`, error);
      }
    }
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  private moveFile(srcPath: string, destPath: string): void {
    try {
      renameSync(srcPath, destPath);
    } catch (error) {
      this.logger.error(
        `Failed to move file from ${srcPath} to ${destPath}`,
        error,
      );
      throw error;
    }
  }

  private getContentType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    };
    return contentTypeMap[ext || ''] || 'application/octet-stream';
  }

  private canEditDocument(user: User): boolean {
    return user?.role === 'admin' || user?.role === 'manager';
  }

  public canDownloadOfficeFile(user: User): boolean {
    return this.canEditDocument(user);
  }

  public canDownloadPdfFile(user: User): boolean {
    return !!user;
  }

  private canAccessDocument(document: DocumentsEntity, user: User): boolean {
    const userAccessLevel = this.getUserAccessLevel(user);
    return userAccessLevel >= document.documentAccessLevel;
  }

  private getUserAccessLevel(user: User): number {
    switch (user.role) {
      case 'admin':
        return 3; // ADMIN
      case 'manager':
        return 2; // MANAGER
      case 'user':
      default:
        return 1; // USER
    }
  }

  private mapToResponse(document: DocumentsEntity): DocumentResponseDto {
    return {
      id: document.id,
      documentKind: document.documentKind,
      documentNumber: document.documentNumber,
      documentName: document.documentName,
      version: document.version,
      documentAccessLevel: document.documentAccessLevel,
      officeFilePath: document.officeFilePath,
      pdfFilePath: document.pdfFilePath,
      createdBy: document.createdBy,
      createdAtUser: document.createdAtUser,
      modifiedBy: document.modifiedBy,
      modifiedAtUser: document.modifiedAtUser,
      downloadedBy: document.downloadedBy,
      downloadedAtUser: document.downloadedAtUser,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
