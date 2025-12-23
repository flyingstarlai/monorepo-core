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
  documentKindCode?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
