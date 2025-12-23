import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentKindDto {
  @ApiProperty({ description: 'Document kind code (unique)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: 'Document kind display name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Document kind description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ description: 'Whether this document kind is active' })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Display order for sorting', required: false })
  @IsOptional()
  @Min(0)
  displayOrder?: number;
}
