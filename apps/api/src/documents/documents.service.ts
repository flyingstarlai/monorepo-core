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
import { formatDateUTC8 } from '../utils/date-formatter';
import { User } from '../users/entities/user.entity';
import { IdGenerator } from '../utils/id-generator';
import {
  existsSync,
  unlinkSync,
  mkdirSync,
  renameSync,
  createReadStream,
} from 'fs';
import { join } from 'path';
import { UPLOAD_DEST_DIR, getDocumentFilePath } from '../config/multer.config';

// Multer file type
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  filename: string;
  path: string;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(DocumentsEntity)
    private readonly documentsRepository: Repository<DocumentsEntity>,
  ) {}

  /**
   * Get all documents
   */
  async findAll(query: any = {}, user: User): Promise<DocumentResponseDto[]> {
    this.logger.log(`Finding documents with query: ${JSON.stringify(query)}`);

    const { documentKind, search } = query;
    const userAccessLevel = this.getUserAccessLevel(user);

    const qb = this.documentsRepository
      .createQueryBuilder('document')
      .orderBy('document.createdAt', 'DESC')
      .where('document.documentAccessLevel <= :userAccessLevel', {
        userAccessLevel,
      });

    if (documentKind) {
      qb.andWhere('document.documentKind = :documentKind', {
        documentKind,
      });
    }

    if (search) {
      qb.andWhere(
        '(document.documentNumber LIKE :search OR document.documentName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const documents = await qb.getMany();
    return documents.map((doc) => this.mapToResponse(doc));
  }

  /**
   * Get document by ID
   */
  async findOne(id: string, user: User): Promise<DocumentResponseDto> {
    this.logger.log(`Finding document with ID: ${id}`);
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

    return this.mapToResponse(document);
  }

  /**
   * Create new document
   */
  async createWithFiles(
    createDocumentDto: CreateDocumentDto,
    user: User,
    officeFile?: MulterFile,
    pdfFile?: MulterFile,
  ): Promise<DocumentResponseDto> {
    this.logger.log(`Creating new document: ${createDocumentDto.documentName}`);

    const document = this.documentsRepository.create({
      id: IdGenerator.generateDocumentId(),
      ...createDocumentDto,
      documentAccessLevel:
        typeof createDocumentDto.documentAccessLevel === 'string'
          ? parseInt(createDocumentDto.documentAccessLevel, 10)
          : (createDocumentDto.documentAccessLevel ?? 1),
      createdBy: user.username,
      createdAtUser: formatDateUTC8(new Date()),
    });

    try {
      const savedDocument = await this.documentsRepository.save(document);
      this.logger.log(
        `Document created successfully with ID: ${savedDocument.id}`,
      );

      // Create directory for document files
      const documentDir = join(
        UPLOAD_DEST_DIR,
        createDocumentDto.documentKind.toLowerCase(),
        savedDocument.id.toString(),
      );
      if (!existsSync(documentDir)) {
        mkdirSync(documentDir, { recursive: true });
      }

      // Handle office file upload
      if (officeFile) {
        this.logger.log(
          `Processing office file: ${JSON.stringify({
            filename: officeFile.filename,
            path: officeFile.path,
            originalname: officeFile.originalname,
            mimetype: officeFile.mimetype,
          })}`,
        );

        const officeFileDir = join(documentDir, 'office');
        if (!existsSync(officeFileDir)) {
          mkdirSync(officeFileDir, { recursive: true });
        }
        const destPath = join(officeFileDir, officeFile.filename);
        this.moveFile(officeFile.path, destPath);
        document.officeFilePath = getDocumentFilePath(
          savedDocument.id,
          createDocumentDto.documentKind,
          'office',
          officeFile.filename,
        );
      }

      // Handle PDF file upload
      if (pdfFile) {
        this.logger.log(
          `Processing PDF file: ${JSON.stringify({
            filename: pdfFile.filename,
            path: pdfFile.path,
            originalname: pdfFile.originalname,
            mimetype: pdfFile.mimetype,
          })}`,
        );

        const pdfFileDir = join(documentDir, 'pdf');
        if (!existsSync(pdfFileDir)) {
          mkdirSync(pdfFileDir, { recursive: true });
        }
        const destPath = join(pdfFileDir, pdfFile.filename);
        this.moveFile(pdfFile.path, destPath);
        document.pdfFilePath = getDocumentFilePath(
          savedDocument.id,
          createDocumentDto.documentKind,
          'pdf',
          pdfFile.filename,
        );
      }

      const finalDocument = await this.documentsRepository.save(document);
      return this.mapToResponse(finalDocument);
    } catch (error) {
      this.logger.error('Failed to create document', error);
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  /**
   * Update existing document
   */
  async updateWithFiles(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    user: User,
    officeFile?: MulterFile,
    pdfFile?: MulterFile,
  ): Promise<DocumentResponseDto> {
    this.logger.log(`Updating document with ID: ${id}`);

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

    const kind = updateDocumentDto.documentKind || document.documentKind;

    // Get existing file paths to delete later if new files are uploaded
    const filesToDelete: string[] = [];
    if (officeFile && document.officeFilePath) {
      filesToDelete.push(join(UPLOAD_DEST_DIR, document.officeFilePath));
    }
    if (pdfFile && document.pdfFilePath) {
      filesToDelete.push(join(UPLOAD_DEST_DIR, document.pdfFilePath));
    }

    try {
      // Create directory for document files if it doesn't exist
      const documentDir = join(UPLOAD_DEST_DIR, kind.toLowerCase(), id);
      if (!existsSync(documentDir)) {
        mkdirSync(documentDir, { recursive: true });
      }

      // Handle new office file upload
      if (officeFile) {
        const officeFileDir = join(documentDir, 'office');
        if (!existsSync(officeFileDir)) {
          mkdirSync(officeFileDir, { recursive: true });
        }
        const destPath = join(officeFileDir, officeFile.filename);
        this.moveFile(officeFile.path, destPath);
        document.officeFilePath = getDocumentFilePath(
          id,
          kind,
          'office',
          officeFile.filename,
        );
      }

      // Handle new PDF file upload
      if (pdfFile) {
        const pdfFileDir = join(documentDir, 'pdf');
        if (!existsSync(pdfFileDir)) {
          mkdirSync(pdfFileDir, { recursive: true });
        }
        const destPath = join(pdfFileDir, pdfFile.filename);
        this.moveFile(pdfFile.path, destPath);
        document.pdfFilePath = getDocumentFilePath(
          id,
          kind,
          'pdf',
          pdfFile.filename,
        );
      }

      // Update document metadata
      const updatedDocument = this.documentsRepository.merge(document, {
        ...updateDocumentDto,
        modifiedBy: user.username,
        modifiedAtUser: formatDateUTC8(new Date()),
      });

      const finalDocument =
        await this.documentsRepository.save(updatedDocument);
      this.logger.log(
        `Document updated successfully with ID: ${finalDocument.id}`,
      );

      // Clean up old files after successful update
      filesToDelete.forEach((filePath) => {
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
          } catch (error) {
            this.logger.error(`Failed to delete file: ${filePath}`, error);
          }
        }
      });

      return this.mapToResponse(finalDocument);
    } catch (error) {
      this.logger.error('Failed to update document', error);
      throw new InternalServerErrorException('Failed to update document');
    }
  }

  /**
   * Delete document
   */
  async remove(id: string, user: User): Promise<void> {
    this.logger.log(`Deleting document with ID: ${id}`);
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

    try {
      // Delete associated files from local storage
      const filesToDelete: string[] = [];
      if (document.officeFilePath) {
        filesToDelete.push(join(UPLOAD_DEST_DIR, document.officeFilePath));
      }
      if (document.pdfFilePath) {
        filesToDelete.push(join(UPLOAD_DEST_DIR, document.pdfFilePath));
      }

      filesToDelete.forEach((filePath) => {
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
          } catch (error) {
            this.logger.error(`Failed to delete file: ${filePath}`, error);
          }
        }
      });

      // Delete document record
      await this.documentsRepository.remove(document);
      this.logger.log(`Document deleted successfully with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete document with ID: ${id}`, error);
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  /**
   * Download document file
   */
  async getFileStream(
    id: string,
    type: 'office' | 'pdf',
    user: User,
  ): Promise<{
    stream: any;
    contentType: string;
    fileName: string;
  }> {
    this.logger.log(`Getting ${type} file stream for document ID: ${id}`);
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

    const filePath =
      type === 'office' ? document.officeFilePath : document.pdfFilePath;

    if (!filePath) {
      throw new NotFoundException(`${type} file not found for document ${id}`);
    }

    // Check additional role-based access for Office files
    if (type === 'office' && !this.canDownloadOfficeFile(user)) {
      throw new ForbiddenException(
        'You are not authorized to download Office files',
      );
    }

    const fullPath = join(UPLOAD_DEST_DIR, filePath);

    if (!existsSync(fullPath)) {
      throw new NotFoundException(`File not found on server`);
    }

    try {
      const stream = createReadStream(fullPath);
      const fileName =
        filePath.split('/').pop() ||
        `document-${id}.${type === 'office' ? 'docx' : 'pdf'}`;
      const contentType = this.getContentType(filePath);

      return { stream, contentType, fileName };
    } catch (error) {
      this.logger.error(`Failed to get file stream for document ${id}`, error);
      throw new InternalServerErrorException('Failed to download file');
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

  /**
   * Check if user can download Office files
   */
  canDownloadOfficeFile(user: User): boolean {
    return user.role === 'admin' || user.role === 'manager';
  }

  /**
   * Check if user can download PDF files
   */
  canDownloadPdfFile(user: User): boolean {
    return true; // All authenticated users can download PDF
  }

  /**
   * Check if user can access document based on access level
   */
  private canAccessDocument(document: DocumentsEntity, user: User): boolean {
    const userAccessLevel = this.getUserAccessLevel(user);
    return userAccessLevel >= document.documentAccessLevel;
  }

  /**
   * Get user's access level based on role
   */
  private getUserAccessLevel(user: User): number {
    switch (user.role) {
      case 'admin':
        return 2; // CONFIDENTIAL
      case 'manager':
        return 1; // RESTRICTED
      case 'user':
      default:
        return 0; // PUBLIC
    }
  }

  /**
   * Record document download
   */
  async recordDownload(id: string, user: User): Promise<void> {
    this.logger.log(
      `Recording download for document ID: ${id} by user: ${user.username}`,
    );

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

    const updatedDocument = this.documentsRepository.merge(document, {
      downloadedBy: user.username,
      downloadedAtUser: formatDateUTC8(new Date()),
    });

    await this.documentsRepository.save(updatedDocument);
  }

  /**
   * Map entity to response DTO
   */
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
