import { ApiProperty } from '@nestjs/swagger';
import {
  OnlyOfficeConfig,
  OnlyOfficeDocumentConfig,
  OnlyOfficeEditorConfig,
} from '../../documents/interfaces/onlyoffice-config.interface';

export class OnlyofficeConfigDto {
  @ApiProperty({ description: 'OnlyOffice Document Server URL' })
  documentServerUrl: string;

  @ApiProperty({ description: 'OnlyOffice configuration' })
  config: OnlyOfficeConfig;
}
