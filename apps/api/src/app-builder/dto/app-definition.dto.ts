import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDefinitionDto {
  @IsString()
  @IsNotEmpty()
  appName: string;

  @IsString()
  @IsNotEmpty()
  appId: string;

  @IsString()
  @IsNotEmpty()
  appModule: string;

  @IsString()
  @IsNotEmpty()
  serverIp: string;

  @IsString()
  @IsNotEmpty()
  companyCode: string;
}

export class UpdateDefinitionDto {
  @IsString()
  @IsOptional()
  appName?: string;

  @IsString()
  @IsOptional()
  appId?: string;

  @IsString()
  @IsOptional()
  appModule?: string;

  @IsString()
  @IsOptional()
  serverIp?: string;

  @IsString()
  @IsOptional()
  companyCode?: string;
}

export class UploadGoogleServicesDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class TriggerBuildDto {
  @IsString()
  @IsOptional()
  parameters?: string;
}
