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
} from 'fs';
import { join } from 'path';
import { UPLOAD_DEST_DIR, getDocumentFilePath } from '../config/multer.config';
import axios from 'axios';

type MulterFile = Express.Multer.File;

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(DocumentsEntity)
    private readonly documentsRepository: Repository<DocumentsEntity>,
  ) {}

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

    const stream = createReadStream(absolutePath);
    const contentType = this.getContentType(filePath);
    const fileName = filePath.split('/').pop() || `${document.id}.${type}`;

    this.logger.log(
      `Stream created. Content-Type: ${contentType}, Filename: ${fileName}`,
    );

    return { stream, contentType, fileName };
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
      writeStream.write(Buffer.from(response.data));
      writeStream.end();

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
      finalWriteStream.write(Buffer.from(response.data));
      finalWriteStream.end();

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

    const config: any = {
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
    config.token = token;

    this.logger.log(
      `Generated OnlyOffice token (first 50 chars): ${token.substring(0, 50)}...`,
    );
    this.logger.log(`Document type: ${config.documentType}`);
    this.logger.log(`Document URL: ${config.document.url}`);
    this.logger.log(`Callback URL: ${config.editorConfig.callbackUrl}`);
    this.logger.log('=== ONLYOFFICE CONFIG END ===');

    return config;
  }

  private async signOnlyOfficeConfig(config: any): Promise<string> {
    try {
      const jwt = require('jsonwebtoken');
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
