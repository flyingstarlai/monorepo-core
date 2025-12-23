import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum DocumentKind {
  PROCEDURE = 'PROCEDURE',
  FORM = 'FORM',
  POLICY = 'POLICY',
  MANUAL = 'MANUAL',
  OTHER = 'OTHER',
}

export class ListDocumentsDto {
  @IsOptional()
  @IsString()
  dockind?: string; // Support both code and legacy string values

  @IsOptional()
  @IsString()
  search?: string;
}
