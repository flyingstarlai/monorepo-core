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

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(DocumentsEntity)
    private readonly documentsRepository: Repository<DocumentsEntity>,
  ) {}

  async handleOnlyOfficeCallback(id: string, callbackData: OnlyofficeCallbackDto): Promise<void> {
    this.logger.log(
      `Handling OnlyOffice callback for document ID: ${id}, action: ${callbackData.actions}`,
    );

    if (!callbackData || (callbackData.actions !== 0 && callbackData.status !== 2)) {
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

      this.logger.log(
        `Document ${id} saved successfully by ${username}`,
      );
    } catch (error) {
      this.logger.error(`Failed to save document ${id} from callback`, error);
      throw new InternalServerErrorException('Failed to save document');
    }
  }

  async getOnlyOfficeConfig(id: string, user: User): Promise<any> {
    this.logger.log(`Getting OnlyOffice config for document ID: ${id}`);
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

    const canEdit = this.canDownloadOfficeFile(user);

    const protocol = process.env.API_PROTOCOL || 'http';
    const host = process.env.API_HOST || 'localhost:3000';
    const documentUrl = `${protocol}://${host}/documents/${id}/download?type=office`;

    const config = {
      document: {
        fileType: document.officeFilePath.split('.').pop()?.toLowerCase() || 'docx',
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
        user: {
          id: user.id,
          name: user.fullName,
        },
        customization: {
          autosave: true,
          forcesave: true,
          forcesavetype: 'update',
        },
      },
    };

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

  private canDownloadOfficeFile(user: User): boolean {
    return user.role === 'admin' || user.role === 'manager';
  }

  private canDownloadPdfFile(user: User): boolean {
    return true; // All authenticated users can download PDF
  }

  private canAccessDocument(document: DocumentsEntity, user: User): boolean {
    const userAccessLevel = this.getUserAccessLevel(user);
    return userAccessLevel >= document.documentAccessLevel;
  }

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
