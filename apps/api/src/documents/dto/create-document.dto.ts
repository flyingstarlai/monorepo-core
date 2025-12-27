import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileType } from './file-type.enum';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Document kind',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentKind: string;

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

  @ApiProperty({
    description: 'Document access level (0=public, 1=user, 2=manager, 3=admin)',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  documentAccessLevel?: number;
}
