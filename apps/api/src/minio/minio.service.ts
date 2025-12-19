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
  createMinioClient,
} from '../config/minio.config';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client | null;
  private readonly googleServicesBucket: string | null;
  private readonly androidArtifactsBucket: string | null;

  constructor(private readonly configService: ConfigService) {
    try {
      const config = getMinioConfig(this.configService);
      this.googleServicesBucket = getGoogleServicesBucket(this.configService);
      this.androidArtifactsBucket = getAndroidArtifactsBucket(
        this.configService,
      );
      this.minioClient = createMinioClient(config);
    } catch {
      this.logger.warn(
        'Minio configuration not available, service will be disabled',
      );
      this.minioClient = null;
      this.googleServicesBucket = null;
      this.androidArtifactsBucket = null;
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
      this.logger.error(
        'Failed to download latest Google Services file',
        error,
      );
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }

  private async ensureGoogleServicesBucketExists(): Promise<void> {
    if (!this.minioClient || !this.googleServicesBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      const exists = await this.minioClient.bucketExists(
        this.googleServicesBucket,
      );
      if (!exists) {
        await this.minioClient.makeBucket(this.googleServicesBucket);
        this.logger.log(`Created bucket: ${this.googleServicesBucket}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure bucket exists: ${this.googleServicesBucket}`,
        error,
      );
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }

  async deleteGoogleServices(filePath: string): Promise<void> {
    if (!this.minioClient || !this.googleServicesBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      await this.minioClient.removeObject(this.googleServicesBucket, filePath);
      this.logger.log(`Deleted Google Services file: ${filePath}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete Google Services file: ${filePath}`,
        error,
      );
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }

  async getDownloadUrl(filePath: string): Promise<string> {
    if (!this.minioClient || !this.googleServicesBucket) {
      throw new InternalServerErrorException('Service temporarily unavailable');
    }

    try {
      return await this.minioClient.presignedGetObject(
        this.googleServicesBucket,
        filePath,
        3600,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate download URL for: ${filePath}`,
        error,
      );
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
        3600,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate android artifact download URL for: ${artifactPath}`,
        error,
      );
      throw new InternalServerErrorException('Service temporarily unavailable');
    }
  }
}
