import { IsString, IsOptional } from 'class-validator';

export class MobileAppBuildDto {
  @IsString()
  id: string;

  @IsString()
  appDefinitionId: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  jenkinsQueueId?: number;

  @IsString()
  @IsOptional()
  jenkinsBuildNumber?: number;

  @IsString()
  @IsOptional()
  artifactPath?: string;

  @IsString()
  @IsOptional()
  consoleUrl?: string;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsString()
  startedBy: string;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsString()
  @IsOptional()
  startedAt?: string;

  @IsString()
  @IsOptional()
  completedAt?: string;
}

export class PresignedDownloadDto {
  @IsString()
  url: string;

  @IsString()
  fileName: string;

  @IsString()
  expiresAt: string;
}
