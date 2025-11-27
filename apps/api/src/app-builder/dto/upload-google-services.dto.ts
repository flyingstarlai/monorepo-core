import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadGoogleServicesDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  identifier?: string;
}
