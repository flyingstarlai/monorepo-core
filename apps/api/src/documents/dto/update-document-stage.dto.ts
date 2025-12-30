import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentStageDto {
  @ApiProperty({
    description: 'Stage title',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: 'Sort order for display ordering',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  sortOrder?: number;
}
