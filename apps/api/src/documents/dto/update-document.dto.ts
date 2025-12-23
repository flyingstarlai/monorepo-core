import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'Document kind code',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentKindCode?: string;

  @ApiProperty({ description: 'Document code/number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentNumber?: string;

  @ApiProperty({ description: 'Document name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentName?: string;

  @ApiProperty({ description: 'Document version' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  version?: string;
}
