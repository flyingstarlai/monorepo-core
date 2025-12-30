import { IsString, IsNotEmpty, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentStageDto {
  @ApiProperty({
    description: 'Stage title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Sort order for display ordering',
    default: 1,
  })
  @IsInt()
  @Min(1)
  sortOrder: number;
}
