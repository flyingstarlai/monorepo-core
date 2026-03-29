import { IsNumber } from 'class-validator';
export class DashboardStatsDto {
  @IsNumber()
  totalUsers: number;
  @IsNumber()
  adminCount: number;
}
