import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { ActivityDto } from './dto/activity.dto';
import { formatDateUTC8, parseUTC8Date } from '../utils/date-formatter';
import { MobileAppsService } from '../mobile-apps/mobile-apps.service';
import { MobileAppOverviewDto } from '../mobile-apps/dto/mobile-app-overview.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mobileAppsService: MobileAppsService,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    // Get mobile apps data

    // Get mobile apps data
    const mobileApps = await this.mobileAppsService.getMobileAppsOverview();

    // Calculate app-focused metrics
    const totalApps = mobileApps.length;
    const totalActiveDevices = mobileApps.reduce(
      (sum, app) => sum + app.activeDevices,
      0,
    );
    const totalUniqueUsers = mobileApps.reduce(
      (sum, app) => sum + app.uniqueUsers,
      0,
    );

    // Calculate version growth metrics
    const versionUpdates = await this.calculateVersionUpdates(mobileApps);
    const versionGrowthRate = await this.calculateVersionGrowthRate(mobileApps);
    const newAppsThisMonth = await this.getNewAppsThisMonth();

    // Get total departments (keep existing user context)
    const departmentsResult = await this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(DISTINCT user.deptName)')
      .where("user.deptName IS NOT NULL AND user.deptName != ''")
      .getRawOne();
    const totalDepartments = parseInt(
      (departmentsResult as { 'COUNT(DISTINCT user.deptName)': string })[
        'COUNT(DISTINCT user.deptName)'
      ] || '0',
    );

    return {
      totalApps,
      activeDevices: totalActiveDevices,
      versionUpdates,
      uniqueUsers: totalUniqueUsers,
      versionGrowthRate: Math.round(versionGrowthRate * 10) / 10,
      newAppsThisMonth,
      totalDepartments,
    };
  }

  private async calculateVersionUpdates(
    mobileApps: MobileAppOverviewDto[],
  ): Promise<number> {
    // For now, return a placeholder - in real implementation, this would track version releases
    // This would require version history tracking in database
    return Math.floor(mobileApps.length * 0.3); // Simulate 30% of apps having version updates
  }

  private async calculateVersionGrowthRate(
    mobileApps: MobileAppOverviewDto[],
  ): Promise<number> {
    // Simplified calculation based on app count growth since version tracking was removed
    const currentApps = mobileApps.length;
    const previousApps = Math.floor(currentApps * 0.8); // Simulate previous app count
    const growthRate = ((currentApps - previousApps) / previousApps) * 100;
    return Math.round(growthRate * 10) / 10; // Round to 1 decimal place
  }

  private async getNewAppsThisMonth(): Promise<number> {
    // Placeholder - in real implementation, this would track app creation dates
    // For now, simulate some new apps
    return Math.floor(Math.random() * 3) + 1; // 1-3 new apps
  }

  async getRecentActivity(): Promise<ActivityDto[]> {
    // Get all users ordered by creation date
    const allUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 20,
      select: [
        'id',
        'username',
        'fullName',
        'deptName',
        'createdAt',
        'updatedAt',
      ],
    });

    // Create activity entries
    const activities: ActivityDto[] = [];

    allUsers.forEach((user) => {
      // Add creation activity
      activities.push({
        id: user.id + '_created',
        username: user.username,
        fullName: user.fullName,
        deptName: user.deptName || 'Unknown',
        action: 'created',
        timestamp: formatDateUTC8(user.createdAt),
      });

      // Add update activity if updatedAt exists and is different from createdAt
      if (
        user.updatedAt &&
        user.updatedAt.getTime() !== user.createdAt.getTime()
      ) {
        activities.push({
          id: user.id + '_updated',
          username: user.username,
          fullName: user.fullName,
          deptName: user.deptName || 'Unknown',
          action: 'updated',
          timestamp: formatDateUTC8(user.updatedAt),
        });
      }
    });

    // Sort by timestamp (most recent first) and take top 7
    return activities
      .sort(
        (a, b) =>
          parseUTC8Date(b.timestamp).getTime() -
          parseUTC8Date(a.timestamp).getTime(),
      )
      .slice(0, 7);
  }
}
