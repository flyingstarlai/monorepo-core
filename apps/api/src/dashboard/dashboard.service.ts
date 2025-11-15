import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { ActivityDto } from './dto/activity.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get total users
    const totalUsers = await this.userRepository.count();

    // Get active users
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });

    // Get total departments
    const departmentsResult = await this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(DISTINCT user.deptName)')
      .where("user.deptName IS NOT NULL AND user.deptName != ''")
      .getRawOne();
    const totalDepartments = parseInt(
      (departmentsResult as any)['COUNT(DISTINCT user.deptName)'] || '0',
    );

    // Get new users in last 30 days
    const newUsersThisMonth = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    // Get users from 30-60 days ago for growth calculation
    const usersPreviousMonth = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :sixtyDaysAgo', { sixtyDaysAgo })
      .andWhere('user.createdAt < :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    // Calculate growth rate
    let growthRate = 0;
    if (usersPreviousMonth > 0) {
      growthRate =
        ((newUsersThisMonth - usersPreviousMonth) / usersPreviousMonth) * 100;
    } else if (newUsersThisMonth > 0) {
      growthRate = 100; // If there were no users before, any new users represent 100% growth
    }

    return {
      totalUsers,
      activeUsers,
      totalDepartments,
      newUsersThisMonth,
      growthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal place
    };
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
        timestamp: user.createdAt.toISOString(),
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
          timestamp: user.updatedAt.toISOString(),
        });
      }
    });

    // Sort by timestamp (most recent first) and take top 10
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);
  }
}
