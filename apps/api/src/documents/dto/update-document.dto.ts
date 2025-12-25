import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'Document kind',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  documentKind?: string;

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

  @ApiProperty({
    description:
      'Document access level (0=PUBLIC, 1=RESTRICTED, 2=CONFIDENTIAL)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  documentAccessLevel?: number;
}
