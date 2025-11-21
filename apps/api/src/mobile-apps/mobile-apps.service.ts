import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileApp } from './entities/mobile-app.entity';
import { MobileAppOverviewDto } from './dto/mobile-app-overview.dto';
import { LoginHistoryQueryDto } from './dto/login-history-query.dto';
import { PaginatedLoginHistoryDto } from './dto/paginated-login-history.dto';
import { AppDeviceDto, toAppDeviceDto } from './dto/app-device.dto';
import { IUsersService } from '../users/interfaces/users-service.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class MobileAppsService {
  constructor(
    @InjectRepository(MobileApp)
    private readonly mobileAppRepository: Repository<MobileApp>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: IUsersService,
  ) {}

  async getMobileAppsOverview(): Promise<MobileAppOverviewDto[]> {
    // Get all records and aggregate in memory for simplicity
    // For large datasets, consider using raw SQL with GROUP BY
    const allApps = await this.mobileAppRepository.find();

    // Group by app_id and app_name
    const grouped = new Map<string, MobileApp[]>();

    allApps.forEach((app) => {
      const key = `${app.appId}|${app.appName}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(app);
    });

    const result: MobileAppOverviewDto[] = [];

    for (const [key, apps] of grouped) {
      const [appId, appName] = key.split('|');

      // Count active devices
      const activeDevices = apps.filter((app) => app.isActive).length;

      // Count unique users by name
      const uniqueUsers = new Set(apps.map((app) => app.name).filter(Boolean))
        .size;

      // Count distinct non-empty companies
      const companies = new Set(
        apps
          .map((app) => app.company)
          .filter((company) => company && company.trim() !== ''),
      ).size;

      result.push({
        appId,
        appName,
        activeDevices,
        totalDevices: apps.length,
        uniqueUsers,
        companies,
      });
    }

    return result;
  }

  async getDevicesByAppId(
    appId: string,
    appName?: string,
  ): Promise<AppDeviceDto[]> {
    const devices = await this.mobileAppRepository.find({
      where: appName ? { appId, appName } : { appId },
      order: { id: 'ASC' },
    });
    return devices.map(toAppDeviceDto);
  }

  async getLoginHistoryByDeviceId(
    appId: string,
    query: LoginHistoryQueryDto,
  ): Promise<PaginatedLoginHistoryDto> {
    return this.usersService.findLoginHistoryByDeviceId(appId, query);
  }
}
