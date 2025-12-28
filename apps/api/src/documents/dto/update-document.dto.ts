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
    description: 'Document access level (0=public, 1=user, 2=manager, 3=admin)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  documentAccessLevel?: number;
}
