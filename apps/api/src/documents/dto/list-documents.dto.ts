import { IsOptional, IsString } from 'class-validator';

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
  documentKind?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
