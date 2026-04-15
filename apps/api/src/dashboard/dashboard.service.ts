import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@repo/api';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { ActivityDto } from './dto/activity.dto';
import { formatDateUTC8, parseUTC8Date } from '../utils/date-formatter';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const totalUsers = await this.userRepository.count();
    const adminCount = await this.userRepository.count({
      where: { role: 'admin' },
    });
    return {
      totalUsers,
      adminCount,
    };
  }

  async getRecentActivity(): Promise<ActivityDto[]> {
    const allUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: 20,
      select: ['id', 'username', 'fullName', 'createdAt', 'updatedAt'],
    });

    const activities: ActivityDto[] = [];

    allUsers.forEach((user) => {
      activities.push({
        id: user.id + '_created',
        username: user.username,
        fullName: user.fullName,
        action: 'created',
        timestamp: formatDateUTC8(user.createdAt),
      });

      if (
        user.updatedAt &&
        user.updatedAt.getTime() !== user.createdAt.getTime()
      ) {
        activities.push({
          id: user.id + '_updated',
          username: user.username,
          fullName: user.fullName,
          action: 'updated',
          timestamp: formatDateUTC8(user.updatedAt),
        });
      }
    });

    return activities
      .sort(
        (a, b) =>
          parseUTC8Date(b.timestamp).getTime() -
          parseUTC8Date(a.timestamp).getTime(),
      )
      .slice(0, 7);
  }
}
