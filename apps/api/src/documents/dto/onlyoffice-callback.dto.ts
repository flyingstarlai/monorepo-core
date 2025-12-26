import { ApiProperty } from '@nestjs/swagger';

export class OnlyofficeCallbackDto {
  @ApiProperty({
    description: 'Callback action type (0=forceSave, 1=correction, 2=meta)',
  })
  actions: number;

  @ApiProperty({ description: 'Document key' })
  key: string;

  @ApiProperty({ description: 'Callback status' })
  status: number;

  @ApiProperty({ description: 'URL to download updated document' })
  url: string;

  @ApiProperty({ description: 'User info' })
  users: any[];

  @ApiProperty({ description: 'Document info' })
  data?: any;

  @ApiProperty({ description: 'Last save time' })
  lastsave?: number;
}
