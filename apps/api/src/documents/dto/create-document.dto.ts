import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Document kind code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dockind: string; // Now accepts any string, validation in service

  @ApiProperty({ description: 'Document code/number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  docno: string;

  @ApiProperty({ description: 'Document name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  docna: string;

  @ApiProperty({ description: 'Document version', default: '1.0' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  docver: string;
}
