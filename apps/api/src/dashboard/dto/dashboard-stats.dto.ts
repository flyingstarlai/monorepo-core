import { IsNumber } from 'class-validator';

export class DashboardStatsDto {
  @IsNumber()
  totalUsers: number;

  @IsNumber()
  activeUsers: number;

  @IsNumber()
  totalDepartments: number;

  @IsNumber()
  newUsersThisMonth: number;

  @IsNumber()
  growthRate: number;
}
