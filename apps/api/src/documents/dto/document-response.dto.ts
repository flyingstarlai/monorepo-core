import { ApiProperty } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({ description: 'Document ID' })
  id: string;

  @ApiProperty({ description: 'Document kind' })
  documentKind: string;

  @ApiProperty({ description: 'Document code/number' })
  documentNumber: string;

  @ApiProperty({ description: 'Document name' })
  documentName: string;

  @ApiProperty({ description: 'Document version' })
  version: string;

  @ApiProperty({
    description: 'Document access level (0=public, 1=user, 2=manager, 3=admin)',
  })
  documentAccessLevel: number;

  @ApiProperty({ description: 'Office file reference (Word/Excel)' })
  officeFilePath: string;

  @ApiProperty({ description: 'PDF file reference' })
  pdfFilePath: string;

  @ApiProperty({ description: 'Document creator' })
  createdBy: string;

  @ApiProperty({ description: 'Document create date' })
  createdAtUser: string;

  @ApiProperty({ description: 'Document modifier' })
  modifiedBy: string;

  @ApiProperty({ description: 'Document modified date' })
  modifiedAtUser: string;

  @ApiProperty({ description: 'Last downloader' })
  downloadedBy: string;

  @ApiProperty({ description: 'Last download date' })
  downloadedAtUser: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}
