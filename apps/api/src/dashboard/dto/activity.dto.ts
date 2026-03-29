import { IsString } from 'class-validator';
export class ActivityDto {
  @IsString()
  id: string;
  @IsString()
  username: string;
  @IsString()
  fullName: string;
  @IsString()
  action: 'created' | 'updated';
  @IsString()
  timestamp: string;
}
