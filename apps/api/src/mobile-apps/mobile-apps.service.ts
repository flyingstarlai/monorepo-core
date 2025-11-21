import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileApp } from './entities/mobile-app.entity';
import { LoginHistory } from './entities/login-history.entity';
import { MobileAppOverviewDto } from './dto/mobile-app-overview.dto';
import { LoginHistoryQueryDto } from './dto/login-history-query.dto';
import { PaginatedLoginHistoryDto } from './dto/paginated-login-history.dto';

@Injectable()
export class MobileAppsService {
  constructor(
    @InjectRepository(MobileApp)
    private readonly mobileAppRepository: Repository<MobileApp>,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
  ) {}

  async getMobileAppsOverview(): Promise<MobileAppOverviewDto[]> {
    // Get all records and aggregate in memory for simplicity
    // For large datasets, consider using raw SQL with GROUP BY
    const allApps = await this.mobileAppRepository.find();

    // Group by app_id and app_name
    const grouped = new Map<string, MobileApp[]>();

    allApps.forEach((app) => {
      const [appId] = app.id.split('@');
      const key = `${appId}|${app.appName}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(app);
    });

    const result: MobileAppOverviewDto[] = [];

    for (const [key, apps] of grouped) {
      const [appId, appName] = key.split('|');

      // Get distinct versions
      const versions = [...new Set(apps.map((app) => app.appVersion))];

      // Find latest version using semantic version comparison when possible
      const latestVersion = this.findLatestVersion(versions);

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
        latestVersion,
        actualLatestVersion: null,
        versions,
        activeDevices,
        totalDevices: apps.length,
        uniqueUsers,
        companies,
      });
    }

    // Compute global latest version across all apps (stable regardless of UI filtering)
    const overallLatest = this.findLatestVersion(
      result.map((r) => r.latestVersion).filter((v): v is string => v !== null),
    );

    return result.map((r) => ({ ...r, actualLatestVersion: overallLatest }));
  }

  private findLatestVersion(versions: string[]): string | null {
    if (versions.length === 0) return null;

    // Try semantic version comparison first
    try {
      const semanticVersions = versions.map((v) => ({
        original: v,
        parts: v.split('.').map((part) => {
          const num = parseInt(part, 10);
          return isNaN(num) ? part : num;
        }),
      }));

      semanticVersions.sort((a, b) => {
        const maxLength = Math.max(a.parts.length, b.parts.length);
        for (let i = 0; i < maxLength; i++) {
          const aPart = a.parts[i] ?? 0;
          const bPart = b.parts[i] ?? 0;

          if (typeof aPart === 'number' && typeof bPart === 'number') {
            if (aPart !== bPart) return bPart - aPart; // descending
          } else {
            // Fallback to string comparison for non-numeric parts
            const comparison = String(bPart).localeCompare(String(aPart));
            if (comparison !== 0) return comparison;
          }
        }
        return 0;
      });

      return semanticVersions[0].original;
    } catch {
      // Fallback to lexicographic comparison
      return versions.sort().reverse()[0];
    }
  }

  async getLoginHistoryByAppId(
    appId: string,
    query: LoginHistoryQueryDto,
  ): Promise<PaginatedLoginHistoryDto> {
    const { page = 1, limit = 50, startDate, endDate } = query;

    console.log('appId', appId);

    // Build query: match records where appId has the format `${appId}@<device>`
    const queryBuilder = this.loginHistoryRepository
      .createQueryBuilder('loginHistory')
      .where('loginHistory.appId LIKE :appIdLike', { appIdLike: `${appId}@%` });

    // Add date range filtering if provided
    if (startDate) {
      queryBuilder.andWhere('loginHistory.loginAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('loginHistory.loginAt <= :endDate', { endDate });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const skip = (page - 1) * limit;
    const loginHistoryRecords = await queryBuilder
      .orderBy('loginHistory.loginAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data: loginHistoryRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
