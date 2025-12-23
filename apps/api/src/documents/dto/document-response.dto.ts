import { ApiProperty } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({ description: 'Document ID' })
  id: number;

  @ApiProperty({ description: 'Document kind code' })
  dockind: string;

  @ApiProperty({ description: 'Document code/number' })
  docno: string;

  @ApiProperty({ description: 'Document name' })
  docna: string;

  @ApiProperty({ description: 'Document version' })
  docver: string;

  @ApiProperty({ description: 'Office file reference (Word/Excel)' })
  docfile: string;

  @ApiProperty({ description: 'PDF file reference' })
  docfilepdf: string;

  @ApiProperty({ description: 'Document creator' })
  docCreator: string;

  @ApiProperty({ description: 'Document create date' })
  docCreate: string;

  @ApiProperty({ description: 'Document modifier' })
  docModifier: string;

  @ApiProperty({ description: 'Document modified date' })
  docModiDate: string;

  @ApiProperty({ description: 'Last downloader' })
  docLoader: string;

  @ApiProperty({ description: 'Last download date' })
  docLoaderDate: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}
