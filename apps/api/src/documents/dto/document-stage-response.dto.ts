import { ApiProperty } from '@nestjs/swagger';

export class DocumentStageResponseDto {
  @ApiProperty({
    description: 'Stage ID',
  })
  id: string;

  @ApiProperty({
    description: 'Stage title',
  })
  title: string;

  @ApiProperty({
    description: 'Sort order for display',
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Document count in this stage',
  })
  documentCount?: number;
}
