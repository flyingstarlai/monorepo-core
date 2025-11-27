import { IsString } from 'class-validator';

export class DashboardModuleDto {
  @IsString()
  value: string;

  @IsString()
  label: string;
}
