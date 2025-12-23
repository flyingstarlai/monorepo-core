import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentsEntity, DocumentKindEntity } from './entities';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { MinioService } from '../minio/minio.service';
import { formatDateUTC8 } from '../utils/date-formatter';
import { User } from '../users/entities/user.entity';

// Multer file type
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(DocumentsEntity)
    private readonly documentsRepository: Repository<DocumentsEntity>,
    @InjectRepository(DocumentKindEntity)
    private readonly documentKindsRepository: Repository<DocumentKindEntity>,
    private readonly minioService: MinioService,
  ) {}

  /**
   * Get all documents
   */
  async findAll(query: any = {}): Promise<DocumentResponseDto[]> {
    this.logger.log(`Finding documents with query: ${JSON.stringify(query)}`);

    const { dockind, search } = query;
    const qb = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.documentKind', 'documentKind')
      .orderBy('document.createdAt', 'DESC');

    if (dockind) {
      qb.andWhere(
        '(document.dockind = :dockind OR documentKind.code = :dockind)',
        {
          dockind,
        },
      );
    }

    if (search) {
      qb.andWhere(
        '(document.docno LIKE :search OR document.docna LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const documents = await qb.getMany();
    return documents.map((doc) => this.mapToResponse(doc));
  }

  /**
   * Get document by ID
   */
  async findOne(id: number): Promise<DocumentResponseDto> {
    this.logger.log(`Finding document with ID: ${id}`);
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['documentKind'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
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
    this.logger.log(`Creating new document: ${createDocumentDto.docna}`);

    // Validate that document kind exists
    const documentKind = await this.documentKindsRepository.findOne({
      where: { code: createDocumentDto.dockind },
    });

    if (!documentKind || !documentKind.isActive) {
      throw new NotFoundException(
        `Document kind '${createDocumentDto.dockind}' not found or is not active`,
      );
    }

    const document = this.documentsRepository.create({
      ...createDocumentDto,
      docCreator: user.username,
      docCreate: formatDateUTC8(new Date()),
      documentKind, // Set the relationship
    });

    try {
      // Handle office file upload
      if (officeFile) {
        const officeFilePath = await this.minioService.uploadDocumentFile(
          null, // document ID will be set after save
          createDocumentDto.dockind,
          'office',
          officeFile.buffer,
          officeFile.originalname,
          officeFile.mimetype,
        );
        document.docfile = officeFilePath;
      }

      // Handle PDF file upload
      if (pdfFile) {
        const pdfFilePath = await this.minioService.uploadDocumentFile(
          null, // document ID will be set after save
          createDocumentDto.dockind,
          'pdf',
          pdfFile.buffer,
          pdfFile.originalname,
          pdfFile.mimetype,
        );
        document.docfilepdf = pdfFilePath;
      }

      const savedDocument = await this.documentsRepository.save(document);
      this.logger.log(
        `Document created successfully with ID: ${savedDocument.id}`,
      );

      return this.mapToResponse(savedDocument);
    } catch (error) {
      this.logger.error('Failed to create document', error);
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  /**
   * Update existing document
   */
  async updateWithFiles(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    user: User,
    officeFile?: MulterFile,
    pdfFile?: MulterFile,
  ): Promise<DocumentResponseDto> {
    this.logger.log(`Updating document with ID: ${id}`);

    const document = await this.findOne(id);

    // Get existing file paths to delete later if new files are uploaded
    const filesToDelete: string[] = [];
    if (officeFile && document.docfile) {
      filesToDelete.push(document.docfile);
    }
    if (pdfFile && document.docfilepdf) {
      filesToDelete.push(document.docfilepdf);
    }

    try {
      // Validate that document kind exists if provided
      let docKindEntity: DocumentKindEntity | undefined;
      if (updateDocumentDto.dockind) {
        docKindEntity = await this.documentKindsRepository.findOne({
          where: { code: updateDocumentDto.dockind },
        });

        if (!docKindEntity || !docKindEntity.isActive) {
          throw new NotFoundException(
            `Document kind '${updateDocumentDto.dockind}' not found or is not active`,
          );
        }
      }

      // Handle new office file upload
      if (officeFile) {
        const officeFilePath = await this.minioService.uploadDocumentFile(
          id,
          updateDocumentDto.dockind || document.dockind,
          'office',
          officeFile.buffer,
          officeFile.originalname,
          officeFile.mimetype,
        );
        document.docfile = officeFilePath;
      }

      // Handle new PDF file upload
      if (pdfFile) {
        const pdfFilePath = await this.minioService.uploadDocumentFile(
          id,
          updateDocumentDto.dockind || document.dockind,
          'pdf',
          pdfFile.buffer,
          pdfFile.originalname,
          pdfFile.mimetype,
        );
        document.docfilepdf = pdfFilePath;
      }

      // Update document metadata
      const updatedDocument = this.documentsRepository.merge(document, {
        ...updateDocumentDto,
        docModifier: user.username,
        docModiDate: formatDateUTC8(new Date()),
        documentKind: docKindEntity ? docKindEntity : undefined,
      });

      const finalDocument =
        await this.documentsRepository.save(updatedDocument);
      this.logger.log(
        `Document updated successfully with ID: ${finalDocument.id}`,
      );

      // Clean up old files after successful update
      if (filesToDelete.length > 0) {
        await this.minioService.deleteDocumentFiles(filesToDelete);
      }

      return this.mapToResponse(finalDocument);
    } catch (error) {
      this.logger.error('Failed to update document', error);
      throw new InternalServerErrorException('Failed to update document');
    }
  }

  /**
   * Delete document
   */
  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting document with ID: ${id}`);
    const document = await this.findOne(id);

    try {
      // Delete associated files from MinIO
      const filesToDelete: string[] = [];
      if (document.docfile) {
        filesToDelete.push(document.docfile);
      }
      if (document.docfilepdf) {
        filesToDelete.push(document.docfilepdf);
      }

      if (filesToDelete.length > 0) {
        await this.minioService.deleteDocumentFiles(filesToDelete);
      }

      // Delete the document record
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
    id: number,
    type: 'office' | 'pdf',
  ): Promise<{
    stream: any;
    contentType: string;
    fileName: string;
  }> {
    this.logger.log(`Getting ${type} file stream for document ID: ${id}`);
    const document = await this.findOne(id);

    const filePath = type === 'office' ? document.docfile : document.docfilepdf;

    if (!filePath) {
      throw new NotFoundException(`${type} file not found for document ${id}`);
    }

    try {
      const result = await this.minioService.downloadDocumentFile(filePath);
      const stream = result.stream;
      const fileName =
        filePath.split('/').pop() ||
        `document-${id}.${type === 'office' ? 'docx' : 'pdf'}`;
      const contentType = result.contentType;

      return { stream, contentType, fileName };
    } catch (error) {
      this.logger.error(`Failed to get file stream for document ${id}`, error);
      throw new InternalServerErrorException('Failed to download file');
    }
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
   * Record document download
   */
  async recordDownload(id: number, user: User): Promise<void> {
    this.logger.log(
      `Recording download for document ID: ${id} by user: ${user.username}`,
    );

    const document = await this.findOne(id);

    const updatedDocument = this.documentsRepository.merge(document, {
      docLoader: user.username,
      docLoaderDate: formatDateUTC8(new Date()),
    });

    await this.documentsRepository.save(updatedDocument);
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(document: DocumentsEntity): DocumentResponseDto {
    return {
      id: document.id,
      dockind: document.documentKind?.code || document.dockind,
      docno: document.docno,
      docna: document.docna,
      docver: document.docver,
      docfile: document.docfile,
      docfilepdf: document.docfilepdf,
      docCreator: document.docCreator,
      docCreate: document.docCreate,
      docModifier: document.docModifier,
      docModiDate: document.docModiDate,
      docLoader: document.docLoader,
      docLoaderDate: document.docLoaderDate,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}

// Export DocumentKindsService
export { DocumentKindsService } from './document-kinds.service';
