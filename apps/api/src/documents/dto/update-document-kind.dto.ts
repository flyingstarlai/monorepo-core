import {
  IsString,
  IsOptional,
  MaxLength,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentKindDto {
  @ApiProperty({ description: 'Document kind code', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({ description: 'Document kind display name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: 'Document kind description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({
    description: 'Whether this document kind is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Display order for sorting', required: false })
  @IsOptional()
  @Min(0)
  displayOrder?: number;
}
