import { ApiProperty } from '@nestjs/swagger';

export class DocumentKindResponseDto {
  @ApiProperty({ description: 'Document kind ID' })
  id: number;

  @ApiProperty({ description: 'Document kind code' })
  code: string;

  @ApiProperty({ description: 'Document kind display name' })
  name: string;

  @ApiProperty({ description: 'Document kind description' })
  description?: string;

  @ApiProperty({ description: 'Whether this document kind is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Display order for sorting' })
  displayOrder: number;

  @ApiProperty({ description: 'Created by user' })
  createdBy?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Modified by user' })
  modifiedBy?: string;

  @ApiProperty({ description: 'Modified at' })
  updatedAt: Date;
}
