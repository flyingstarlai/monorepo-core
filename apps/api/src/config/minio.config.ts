import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
}

export const getMinioConfig = (configService: ConfigService): MinioConfig => {
  const endPoint = configService.get<string>('MINIO_ENDPOINT');
  const port = parseInt(configService.get<string>('MINIO_PORT') || '9000');
  const useSSL = configService.get<string>('MINIO_USE_SSL') === 'true';
  const accessKey = configService.get<string>('MINIO_ACCESS_KEY');
  const secretKey = configService.get<string>('MINIO_SECRET_KEY');

  if (!endPoint || !accessKey || !secretKey) {
    throw new Error('Missing required Minio configuration');
  }

  return {
    endPoint,
    port,
    useSSL,
    accessKey,
    secretKey,
  };
};

export const getGoogleServicesBucket = (
  configService: ConfigService,
): string => {
  const bucket = configService.get<string>('MINIO_GOOGLE_SERVICES_BUCKET');
  if (!bucket) {
    throw new Error('MINIO_GOOGLE_SERVICES_BUCKET is not configured');
  }
  return bucket;
};

export const getAndroidArtifactsBucket = (
  configService: ConfigService,
): string => {
  const bucket = configService.get<string>('MINIO_ANDROID_ARTIFACTS_BUCKET');
  if (!bucket) {
    throw new Error('MINIO_ANDROID_ARTIFACTS_BUCKET is not configured');
  }
  return bucket;
};

export const getDocumentsBucket = (configService: ConfigService): string => {
  const bucket = configService.get<string>('MINIO_DOCUMENTS_BUCKET');
  if (!bucket) {
    throw new Error('MINIO_DOCUMENTS_BUCKET is not configured');
  }
  return bucket;
};

export const createMinioClient = (config: MinioConfig): Minio.Client => {
  return new Minio.Client(config);
};
