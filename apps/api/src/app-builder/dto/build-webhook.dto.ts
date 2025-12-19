import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

export class BuildWebhookDto {
  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  artifactPath?: string;

  @IsString()
  @IsOptional()
  error?: string;

  @IsString()
  @IsOptional()
  errorCategory?: string;

  @IsString()
  @IsOptional()
  errorDetails?: string;

  @IsNumber()
  @IsOptional()
  startTime?: number;

  @IsNumber()
  @IsOptional()
  endTime?: number;

  @IsObject()
  @IsOptional()
  metrics?: {
    memoryUsage?: number;
    cpuUsage?: number;
    [key: string]: any;
  };
}
