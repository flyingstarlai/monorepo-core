import { IsNumber } from 'class-validator';

export class DashboardStatsDto {
  // App-focused metrics
  @IsNumber()
  totalApps: number;

  @IsNumber()
  activeDevices: number;

  @IsNumber()
  versionUpdates: number;

  @IsNumber()
  uniqueUsers: number;

  // Growth metrics
  @IsNumber()
  versionGrowthRate: number;

  @IsNumber()
  newAppsThisMonth: number;

  // Keep some user context
  @IsNumber()
  totalDepartments: number;
}
