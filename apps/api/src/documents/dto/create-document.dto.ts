import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Document kind code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentKindCode: string;

  @ApiProperty({ description: 'Document code/number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentNumber: string;

  @ApiProperty({ description: 'Document name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  documentName: string;

  @ApiProperty({ description: 'Document version', default: '1.0' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  version: string;
}
