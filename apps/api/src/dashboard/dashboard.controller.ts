import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { ActivityDto } from './dto/activity.dto';

@Controller('dashboard')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getDashboardStats();
  }

  @Get('activity')
  async getActivity(): Promise<ActivityDto[]> {
    return this.dashboardService.getRecentActivity();
  }

  @Get('test-activity')
  async testActivity(): Promise<ActivityDto[]> {
    return this.dashboardService.getRecentActivity();
  }
}
