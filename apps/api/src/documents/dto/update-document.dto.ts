import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'Document kind code',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dockind?: string; // Now accepts any string, validation in service

  @ApiProperty({ description: 'Document code/number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  docno?: string;

  @ApiProperty({ description: 'Document name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  docna?: string;

  @ApiProperty({ description: 'Document version' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  docver?: string;
}
