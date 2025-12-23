import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import {
  getMinioConfig,
  getGoogleServicesBucket,
  getAndroidArtifactsBucket,
  getDocumentsBucket,
  createMinioClient,
} from '../config/minio.config';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client | null;
  private readonly googleServicesBucket: string | null;
  private readonly androidArtifactsBucket: string | null;
  private readonly documentsBucket: string | null;

  constructor(private readonly configService: ConfigService) {
    try {
      const config = getMinioConfig(this.configService);
      this.googleServicesBucket = getGoogleServicesBucket(this.configService);
      this.androidArtifactsBucket = getAndroidArtifactsBucket(
        this.configService,
      );
      this.documentsBucket = getDocumentsBucket(this.configService);
      this.minioClient = createMinioClient(config);
    } catch {
      this.logger.warn(
        'Minio configuration not available, service will be disabled',
      );
      this.minioClient = null;
      this.googleServicesBucket = null;
      this.androidArtifactsBucket = null;
      this.documentsBucket = null;
    }
  }

  async uploadGoogleServices(content: string): Promise<string> {
    if (!this.minioClient || !this.googleServicesBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      await this.ensureGoogleServicesBucketExists();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `google-services-${timestamp}.json`;
      const latestPath = 'latest/google-services.json';

      // Upload timestamped version for backup
      await this.minioClient.putObject(
        this.googleServicesBucket,
        fileName,
        content,
        content.length,
        { 'Content-Type': 'application/json' },
      );

      // Update latest pointer
      await this.minioClient.putObject(
        this.googleServicesBucket,
        latestPath,
        content,
        content.length,
        { 'Content-Type': 'application/json' },
      );

      this.logger.log(
        `Google Services file uploaded successfully to ${latestPath}`,
      );
      return latestPath;
    } catch (error) {
      this.logger.error('Failed to upload Google Services file', error);
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }

  async downloadLatestGoogleServices(): Promise<Buffer> {
    if (!this.minioClient || !this.googleServicesBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      const stream = await this.minioClient.getObject(
        this.googleServicesBucket,
        'latest/google-services.json',
      );

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Failed to download Google Services file', error);
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }

  async uploadAndroidArtifact(
    appName: string,
    versionName: string,
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    if (!this.minioClient || !this.androidArtifactsBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      await this.ensureAndroidArtifactsBucketExists();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const objectPath = `${appName}/${versionName}/${timestamp}-${fileName}`;

      await this.minioClient.putObject(
        this.androidArtifactsBucket,
        objectPath,
        file,
        file.length,
        { 'Content-Type': contentType },
      );

      this.logger.log(
        `Android artifact uploaded successfully to ${objectPath}`,
      );
      return objectPath;
    } catch (error) {
      this.logger.error('Failed to upload Android artifact', error);
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }

  async getAndroidArtifactDownloadUrl(artifactPath: string): Promise<string> {
    if (!this.minioClient || !this.androidArtifactsBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      return await this.minioClient.presignedGetObject(
        this.androidArtifactsBucket,
        artifactPath,
        3600, // 1 hour expiry
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate android artifact download URL for: ${artifactPath}`,
        error,
      );
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }

  async uploadDocumentFile(
    documentId: number,
    kind: string,
    fileType: 'office' | 'pdf',
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    if (!this.minioClient || !this.documentsBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      await this.ensureDocumentsBucketExists();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const objectPath = `documents/${kind.toLowerCase()}/${documentId}/${fileType}/${timestamp}-${sanitizedFileName}`;

      await this.minioClient.putObject(
        this.documentsBucket,
        objectPath,
        file,
        file.length,
        { 'Content-Type': contentType },
      );

      return objectPath;
    } catch (error) {
      this.logger.error(`Failed to upload document file: ${fileName}`, error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getDocumentFile(
    bucket: string,
    objectPath: string,
  ): Promise<{
    stream: any;
    contentType: string;
    fileName: string;
  }> {
    if (!this.minioClient) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      const stream = await this.minioClient.getObject(bucket, objectPath);

      const fileName = objectPath.split('/').pop() || 'document-file';
      const contentType = this.getContentType(objectPath);

      return { stream, contentType, fileName };
    } catch (error) {
      this.logger.error(
        `Failed to download document file: ${objectPath}`,
        error,
      );
      throw new InternalServerErrorException('File not found or unavailable');
    }
  }

  private getContentType(objectPath: string): string {
    const extension = objectPath.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    };

    return contentTypeMap[extension || ''] || 'application/octet-stream';
  }

  async downloadDocumentFile(filePath: string): Promise<{
    stream: NodeJS.ReadableStream;
    contentType: string;
  }> {
    if (!this.minioClient || !this.documentsBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      const stream = await this.minioClient.getObject(
        this.documentsBucket,
        filePath,
      );

      const extension = filePath.split('.').pop()?.toLowerCase();
      const contentType = this.getContentTypeFromExtension(extension);

      return { stream, contentType };
    } catch (error) {
      this.logger.error(`Failed to download document file: ${filePath}`, error);
      throw new InternalServerErrorException('File not found or unavailable');
    }
  }

  async deleteDocumentFiles(filePaths: string[]): Promise<void> {
    if (!this.minioClient || !this.documentsBucket) {
      return; // Silently ignore if service is unavailable
    }

    try {
      const deletePromises = filePaths.map(async (filePath) => {
        try {
          await this.minioClient.removeObject(this.documentsBucket!, filePath);
          this.logger.log(`Deleted document file: ${filePath}`);
        } catch (error) {
          this.logger.warn(
            `Failed to delete document file: ${filePath}`,
            error,
          );
        }
      });

      await Promise.all(deletePromises);
      this.logger.log(`Processed ${filePaths.length} document file deletions`);
    } catch (error) {
      this.logger.error('Failed to delete document files', error);
    }
  }

  async getDocumentDownloadUrl(filePath: string): Promise<string> {
    if (!this.minioClient || !this.documentsBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      return await this.minioClient.presignedGetObject(
        this.documentsBucket,
        filePath,
        3600, // 1 hour expiry
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate document download URL for: ${filePath}`,
        error,
      );
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }

  private getContentTypeFromExtension(extension?: string): string {
    const contentTypeMap: Record<string, string> = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    };

    return contentTypeMap[extension || ''] || 'application/octet-stream';
  }

  private async ensureDocumentsBucketExists(): Promise<void> {
    if (!this.minioClient || !this.documentsBucket) {
      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(this.documentsBucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.documentsBucket);
        this.logger.log(`Created documents bucket: ${this.documentsBucket}`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure documents bucket exists`, error);
    }
  }

  private async ensureGoogleServicesBucketExists(): Promise<void> {
    if (!this.minioClient || !this.googleServicesBucket) {
      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(
        this.googleServicesBucket,
      );
      if (!exists) {
        await this.minioClient.makeBucket(this.googleServicesBucket);
        this.logger.log(
          `Created google services bucket: ${this.googleServicesBucket}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure google services bucket exists`,
        error,
      );
    }
  }

  private async ensureAndroidArtifactsBucketExists(): Promise<void> {
    if (!this.minioClient || !this.androidArtifactsBucket) {
      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(
        this.androidArtifactsBucket,
      );
      if (!exists) {
        await this.minioClient.makeBucket(this.androidArtifactsBucket);
        this.logger.log(
          `Created android artifacts bucket: ${this.androidArtifactsBucket}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure android artifacts bucket exists`,
        error,
      );
    }
  }
}
