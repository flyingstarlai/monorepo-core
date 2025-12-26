import { ApiProperty } from '@nestjs/swagger';

export class OnlyofficeConfigDto {
  @ApiProperty({ description: 'OnlyOffice Document Server URL' })
  documentServerUrl: string;

  @ApiProperty({ description: 'OnlyOffice configuration token' })
  token: string;
}
