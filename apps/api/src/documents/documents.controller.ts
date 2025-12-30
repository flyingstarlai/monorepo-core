import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
  HttpCode,
  Logger,
  Query,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { OnlyofficeConfigDto } from './dto/onlyoffice-config.dto';
import { OnlyofficeCallbackDto } from './dto/onlyoffice-callback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface ConversionStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  error?: string;
  createdAt: string;
}
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OnlyofficeAuthorized } from '../auth/decorators/onlyoffice-authorized.decorator';
import { User } from '../users/entities/user.entity';

import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  private checkFeatureFlag() {
    if (process.env.FEATURE_DOC_UPLOAD !== 'true') {
      throw new NotFoundException('Document center is not available');
    }
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get all documents' })
  @ApiQuery({ name: 'kind', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of documents',
    type: [DocumentResponseDto],
  })
  async findAll(
    @Query() query: ListDocumentsDto,
    @Req() req: any,
  ): Promise<DocumentResponseDto[]> {
    this.checkFeatureFlag();
    const user = req.user as User;
    return this.documentsService.findAll(query, user);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Document details',
    type: DocumentResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<DocumentResponseDto> {
    this.checkFeatureFlag();
    const user = req.user as User;
    return this.documentsService.findOne(id, user);
  }

  @Post()
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 2))
  @ApiOperation({ summary: 'Create new document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Document created',
    type: DocumentResponseDto,
  })
  async create(
    @Req() req: any,
    @UploadedFiles() files: any[],
  ): Promise<DocumentResponseDto> {
    this.checkFeatureFlag();

    const user = req.user as User;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const createDocumentDto = {
      documentKind: req.body.documentKind,
      documentNumber: req.body.documentNumber,
      documentName: req.body.documentName,
      version: req.body.version,
      documentAccessLevel: req.body.documentAccessLevel,
      stageId: req.body.stageId || undefined,
    } as CreateDocumentDto;

    let officeFile: any | undefined;
    let pdfFile: any | undefined;

    if (files && files.length > 0) {
      this.logger.log(`Received ${files.length} file(s) for document creation`);

      officeFile = files.find(
        (file) =>
          file.mimetype.includes('wordprocessingml.document') ||
          file.mimetype.includes('spreadsheetml.sheet') ||
          file.mimetype.includes('msword') ||
          file.mimetype.includes('vnd.ms-excel'),
      );
      pdfFile = files.find((file) => file.mimetype === 'application/pdf');

      const validationErrors: string[] = [];

      if (officeFile) {
        const ext = officeFile.originalname.split('.').pop()?.toLowerCase();
        const allowed = ['doc', 'docx', 'xls', 'xlsx'];
        if (!ext || !allowed.includes(ext)) {
          validationErrors.push(`Office file: invalid type "${ext}"`);
          this.logger.warn(
            `Invalid office file type: ${ext} (allowed: ${allowed.join(', ')})`,
          );
        }
      }

      if (pdfFile) {
        if (pdfFile.mimetype !== 'application/pdf') {
          validationErrors.push(
            `PDF file: invalid mimetype "${pdfFile.mimetype}"`,
          );
          this.logger.warn(`Invalid PDF file mimetype: ${pdfFile.mimetype}`);
        }
      }

      if (validationErrors.length > 0) {
        throw new BadRequestException(
          `Invalid file types: ${validationErrors.join('; ')}`,
        );
      }

      if (!officeFile && !pdfFile) {
        this.logger.warn('No files received for document creation');
        throw new BadRequestException('At least one file is required');
      }
    }

    return this.documentsService.createWithFiles(
      createDocumentDto,
      user,
      officeFile,
      pdfFile,
    );
  }

  @Post(':id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 2))
  @ApiOperation({ summary: 'Update existing document' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Document updated',
    type: DocumentResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @UploadedFiles() files: any[],
  ): Promise<DocumentResponseDto> {
    this.checkFeatureFlag();

    const user = req.user as User;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const updateDocumentDto = {
      documentKind: req.body.documentKind,
      documentNumber: req.body.documentNumber,
      documentName: req.body.documentName,
      version: req.body.version,
      documentAccessLevel: req.body.documentAccessLevel,
      stageId: req.body.stageId || undefined,
    } as UpdateDocumentDto;

    let officeFile: any | undefined;
    let pdfFile: any | undefined;

    if (files && files.length > 0) {
      this.logger.log(`Received ${files.length} file(s) for document update`);

      officeFile = files.find(
        (file) =>
          file.mimetype.includes('wordprocessingml.document') ||
          file.mimetype.includes('spreadsheetml.sheet') ||
          file.mimetype.includes('msword') ||
          file.mimetype.includes('vnd.ms-excel'),
      );
      pdfFile = files.find((file) => file.mimetype === 'application/pdf');

      const validationErrors: string[] = [];

      if (officeFile) {
        const ext = officeFile.originalname.split('.').pop()?.toLowerCase();
        const allowed = ['doc', 'docx', 'xls', 'xlsx'];
        if (!ext || !allowed.includes(ext)) {
          validationErrors.push(`Office file: invalid type "${ext}"`);
          this.logger.warn(
            `Invalid office file type: ${ext} (allowed: ${allowed.join(', ')})`,
          );
        }
      }

      if (pdfFile) {
        if (pdfFile.mimetype !== 'application/pdf') {
          validationErrors.push(
            `PDF file: invalid mimetype "${pdfFile.mimetype}"`,
          );
          this.logger.warn(`Invalid PDF file mimetype: ${pdfFile.mimetype}`);
        }
      }

      if (validationErrors.length > 0) {
        throw new BadRequestException(
          `Invalid file types: ${validationErrors.join('; ')}`,
        );
      }

      if (!officeFile && !pdfFile) {
        this.logger.warn('No files received for document update');
        throw new BadRequestException('At least one file is required');
      }
    }

    return this.documentsService.updateWithFiles(
      id,
      updateDocumentDto,
      user,
      officeFile,
      pdfFile,
    );
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 204, description: 'Document deleted' })
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    this.checkFeatureFlag();
    const user = req.user as User;
    await this.documentsService.remove(id, user);
  }

  @Get(':id/download')
  @OnlyofficeAuthorized()
  @ApiOperation({ summary: 'Download document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiQuery({
    name: 'type',
    enum: ['office', 'pdf'],
    description: 'Download type: office for Word/Excel, pdf for PDF',
  })
  @ApiResponse({ status: 200, description: 'File download' })
  async download(
    @Param('id') id: string,
    @Query('type') type: 'office' | 'pdf' = 'pdf',
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    this.checkFeatureFlag();

    this.logger.log('=== DOCUMENT DOWNLOAD REQUEST START ===');
    this.logger.log(`Document ID: ${id}`);
    this.logger.log(`Download type: ${type}`);

    const authHeader = req.headers['authorization'];
    const onlyofficeSecretHeader = req.headers['x-onlyoffice-secret'];
    const isOnlyofficeRequest = req.onlyofficeAuthorized === true;
    this.logger.log(
      `Authorization header: ${authHeader ? authHeader.substring(0, 50) : 'NONE'}`,
    );
    this.logger.log(
      `X-OnlyOffice-Secret header: ${
        onlyofficeSecretHeader
          ? onlyofficeSecretHeader.substring(0, 50)
          : 'NONE'
      }`,
    );
    this.logger.log(`OnlyOffice authorized: ${isOnlyofficeRequest}`);

    const user = req.user as User | undefined;
    if (user) {
      this.logger.log(
        `Request user ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`,
      );
    }

    if (!user && !isOnlyofficeRequest) {
      this.logger.warn('No authenticated user present for download request');
      throw new ForbiddenException('User not authenticated');
    }

    if (!isOnlyofficeRequest && user) {
      if (
        type === 'office' &&
        !this.documentsService.canDownloadOfficeFile(user)
      ) {
        throw new ForbiddenException(
          'You are not authorized to download Office files',
        );
      }

      if (type === 'pdf' && !this.documentsService.canDownloadPdfFile(user)) {
        throw new ForbiddenException(
          'You are not authorized to download PDF files',
        );
      }
    }

    this.logger.log(
      `Download authorization check passed - User: ${user?.role || 'system'}, Type: ${type}`,
    );

    try {
      const { stream, contentType, fileName, fileSize } =
        await this.documentsService.getFileStream(id, type, user ?? null, {
          bypassAccessCheck: isOnlyofficeRequest,
        });

      if (!isOnlyofficeRequest && user) {
        await this.documentsService.recordDownload(id, user);
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.setHeader('Cache-Control', 'no-cache');
      if (fileSize) {
        res.setHeader('Content-Length', fileSize);
      }

      stream.pipe(res);

      this.logger.log('=== DOCUMENT DOWNLOAD SUCCESS ===');
      this.logger.log(`Document ${id} streamed successfully to client`);
    } catch (error) {
      this.logger.error(`Failed to download document ${id}`, error);
      this.logger.error(`Error details: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to download file');
    }
  }

  @Get(':id/office')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get OnlyOffice configuration' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'OnlyOffice configuration',
    type: OnlyofficeConfigDto,
  })
  async getOnlyOfficeConfig(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<OnlyofficeConfigDto> {
    this.checkFeatureFlag();

    const user = req.user as User;
    const documentServerUrl = process.env.ONLYOFFICE_DOCUMENT_SERVER_URL;

    if (!documentServerUrl) {
      throw new InternalServerErrorException(
        'OnlyOffice Document Server is not configured',
      );
    }

    const config = await this.documentsService.getOnlyOfficeConfig(id, user);

    return {
      documentServerUrl,
      config,
    };
  }

  @Post(':id/office/callback')
  @OnlyofficeAuthorized()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OnlyOffice callback' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Callback handled' })
  async handleOnlyOfficeCallback(
    @Param('id') id: string,
    @Body() callbackDto: OnlyofficeCallbackDto,
  ): Promise<{ error: number }> {
    this.checkFeatureFlag();

    this.logger.log('=== ONLYOFFICE CALLBACK REQUEST START ===');
    this.logger.log(`Document ID: ${id}`);
    this.logger.log(`Callback payload: ${JSON.stringify(callbackDto)}`);

    await this.documentsService.handleOnlyOfficeCallback(id, callbackDto);

    this.logger.log('=== ONLYOFFICE CALLBACK REQUEST END ===');

    return { error: 0 };
  }

  @Post(':id/convert-pdf')
  @Roles('admin', 'manager', 'user')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Initiate PDF conversion' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 202,
    description: 'Conversion initiated',
    schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'Conversion job ID' },
      },
    },
  })
  async initiatePdfConversion(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ jobId: string }> {
    this.checkFeatureFlag();

    const user = req.user as User;
    this.logger.log(
      `User ${user.id} initiating PDF conversion for document ${id}`,
    );

    try {
      const jobId = await this.documentsService.initiatePdfConversion(id, user);
      return { jobId };
    } catch (error) {
      this.logger.error(
        `Failed to initiate PDF conversion for document ${id}`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to initiate PDF conversion',
      );
    }
  }

  @Get(':id/convert-status/:jobId')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Get conversion status' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiParam({ name: 'jobId', description: 'Conversion job ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversion status',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'completed', 'failed'],
        },
        pdfUrl: { type: 'string' },
        error: { type: 'string' },
        createdAt: { type: 'string' },
      },
    },
  })
  async getConversionStatus(
    @Param('id') id: string,
    @Param('jobId') jobId: string,
  ): Promise<ConversionStatusResponse> {
    const job = this.documentsService.getConversionStatus(jobId);

    if (!job) {
      throw new NotFoundException('Conversion job not found');
    }

    return {
      status: job.status,
      pdfUrl: job.pdfUrl,
      error: job.error,
      createdAt: job.createdAt.toISOString(),
    };
  }

  @Get(':id/download-pdf')
  @Roles('admin', 'manager', 'user')
  @ApiOperation({ summary: 'Download converted PDF' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'PDF file download' })
  async downloadConvertedPdf(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    this.checkFeatureFlag();

    const user = req.user as User;
    this.logger.log(
      `User ${user.id} downloading converted PDF for document ${id}`,
    );

    try {
      const { stream, contentType, fileName, fileSize } =
        await this.documentsService.downloadConvertedPdf(id, user);

      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.setHeader('Cache-Control', 'no-cache');
      if (fileSize) {
        res.setHeader('Content-Length', fileSize);
      }

      stream.pipe(res);

      this.logger.log(`PDF download successful for document ${id}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to download converted PDF for document ${id}`,
        error,
      );

      if (error.jobId) {
        res.status(HttpStatus.ACCEPTED).json({ jobId: error.jobId });
        return;
      }

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to download converted PDF',
      );
    }
  }
}
