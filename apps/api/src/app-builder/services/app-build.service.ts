import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { MobileAppBuild } from '../entities/app-build.entity';
import { IdGenerator } from '../../utils/id-generator';

export interface BuildFilters {
  definitionId?: string;
  statuses?: string[];
  appIds?: string[];
  modules?: string[];
  startedBy?: string;
  buildType?: 'release' | 'debug' | 'profile';
  environment?: string;
  errorCategory?: string;
  isAutomated?: boolean;
  branchName?: string;
  searchQuery?: string;
  buildNumber?: {
    from?: number;
    to?: number;
  };
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  durationRange?: {
    from?: number; // in milliseconds
    to?: number; // in milliseconds
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface AnalyticsConfig {
  timeRange: number;
  groupBy: string;
}

export interface BuildAnalytics {
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  averageBuildTime: number;
  successRate: number;
  failureRate: number;
  buildsByTimeRange: Array<{
    date: string;
    builds: number;
    successes: number;
    failures: number;
  }>;
  buildsByModule: Array<{
    module: string;
    builds: number;
    successes: number;
    failures: number;
  }>;
  buildsByUser: Array<{
    user: string;
    builds: number;
    successes: number;
    failures: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  performanceMetrics: {
    fastestBuild: {
      id: string;
      duration: number;
      appName: string;
    };
    slowestBuild: {
      id: string;
      duration: number;
      appName: string;
    };
    mostActiveUser: {
      user: string;
      builds: number;
      successes: number;
      failures: number;
    };
    mostBuiltApp: {
      app: string;
      buildCount: number;
    };
  };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class MobileAppBuildService {
  constructor(
    @InjectRepository(MobileAppBuild)
    private readonly mobileAppBuildRepository: Repository<MobileAppBuild>,
  ) {}

  async findByDefinitionId(definitionId: string): Promise<MobileAppBuild[]> {
    return this.mobileAppBuildRepository.find({
      where: { appDefinitionId: definitionId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<MobileAppBuild | null> {
    return this.mobileAppBuildRepository.findOne({
      where: { id },
      relations: ['appDefinition'],
    });
  }

  async create(buildData: Partial<MobileAppBuild>): Promise<MobileAppBuild> {
    const build = this.mobileAppBuildRepository.create({
      id: IdGenerator.generateBuildId(),
      ...buildData,
    });
    return this.mobileAppBuildRepository.save(build);
  }

  async update(
    id: string,
    updateData: Partial<MobileAppBuild>,
  ): Promise<MobileAppBuild> {
    await this.mobileAppBuildRepository.update(id, updateData);
    return this.findById(id);
  }

  async findByStatus(
    status: 'queued' | 'building' | 'completed' | 'failed' | 'cancelled',
  ): Promise<MobileAppBuild[]> {
    return this.mobileAppBuildRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveBuilds(): Promise<MobileAppBuild[]> {
    return this.mobileAppBuildRepository.find({
      where: { status: 'queued' },
      order: { createdAt: 'ASC' },
    });
  }

  async findWithFilters(
    filters: BuildFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<MobileAppBuild>> {
    const whereCondition: Partial<MobileAppBuild> & Record<string, any> = {};

    // Apply filters
    if (filters.definitionId) {
      whereCondition.appDefinitionId = filters.definitionId;
    }

    if (filters.statuses && filters.statuses.length > 0) {
      whereCondition.status = In(filters.statuses);
    }

    if (filters.startedBy) {
      whereCondition.startedBy = filters.startedBy;
    }

    // Enhanced filters for new fields
    if (filters.buildType) {
      whereCondition.buildType = filters.buildType;
    }

    if (filters.environment) {
      whereCondition.environment = filters.environment;
    }

    if (filters.errorCategory) {
      whereCondition.errorCategory = filters.errorCategory;
    }

    if (filters.isAutomated !== undefined) {
      whereCondition.isAutomated = filters.isAutomated;
    }

    if (filters.buildNumber) {
      if (filters.buildNumber.from && filters.buildNumber.to) {
        whereCondition.jenkinsBuildNumber = Between(
          filters.buildNumber.from,
          filters.buildNumber.to,
        );
      } else if (filters.buildNumber.from) {
        whereCondition.jenkinsBuildNumber = MoreThanOrEqual(
          filters.buildNumber.from,
        );
      } else if (filters.buildNumber.to) {
        whereCondition.jenkinsBuildNumber = LessThanOrEqual(
          filters.buildNumber.to,
        );
      }
    }

    if (filters.dateRange) {
      if (filters.dateRange.from && filters.dateRange.to) {
        whereCondition.createdAt = Between(
          filters.dateRange.from,
          filters.dateRange.to,
        );
      } else if (filters.dateRange.from) {
        whereCondition.createdAt = MoreThanOrEqual(filters.dateRange.from);
      } else if (filters.dateRange.to) {
        whereCondition.createdAt = LessThanOrEqual(filters.dateRange.to);
      }
    }

    if (filters.durationRange) {
      if (filters.durationRange.from && filters.durationRange.to) {
        whereCondition.durationMs = Between(
          filters.durationRange.from,
          filters.durationRange.to,
        );
      } else if (filters.durationRange.from) {
        whereCondition.durationMs = MoreThanOrEqual(filters.durationRange.from);
      } else if (filters.durationRange.to) {
        whereCondition.durationMs = LessThanOrEqual(filters.durationRange.to);
      }
    }

    // Complex filters for appIds and modules require joins
    let queryBuilder = this.mobileAppBuildRepository
      .createQueryBuilder('build')
      .leftJoinAndSelect('build.appDefinition', 'definition')
      .where(whereCondition);

    if (filters.appIds && filters.appIds.length > 0) {
      queryBuilder = queryBuilder.andWhere('definition.appId IN (:...appIds)', {
        appIds: filters.appIds,
      });
    }

    if (filters.modules && filters.modules.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        'definition.appModule IN (:...modules)',
        {
          modules: filters.modules,
        },
      );
    }

    if (filters.branchName) {
      queryBuilder = queryBuilder.andWhere('build.branchName = :branchName', {
        branchName: filters.branchName,
      });
    }

    // Text search for error messages and build logs
    if (filters.searchQuery) {
      queryBuilder = queryBuilder.andWhere(
        '(build.errorMessage LIKE :searchQuery OR build.errorDetails LIKE :searchQuery OR build.buildLogsSummary LIKE :searchQuery)',
        { searchQuery: `%${filters.searchQuery}%` },
      );
    }

    // Apply sorting
    const sortField = this.getValidSortField(pagination.sort);
    queryBuilder = queryBuilder.orderBy(
      `build.${sortField}`,
      pagination.order.toUpperCase() as 'ASC' | 'DESC',
    );

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    queryBuilder = queryBuilder.skip(offset).take(pagination.limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page * pagination.limit < total,
      hasPrev: pagination.page > 1,
    };
  }

  async getAnalytics(config: AnalyticsConfig): Promise<BuildAnalytics> {
    const now = new Date();
    const startDate = new Date(
      now.getTime() - config.timeRange * 24 * 60 * 60 * 1000,
    );

    const builds = await this.mobileAppBuildRepository
      .createQueryBuilder('build')
      .leftJoinAndSelect('build.appDefinition', 'definition')
      .where('build.createdAt >= :startDate', { startDate })
      .orderBy('build.createdAt', 'DESC')
      .getMany();

    const totalBuilds = builds.length;
    const successfulBuilds = builds.filter(
      (b) => b.status === 'completed',
    ).length;
    const failedBuilds = builds.filter((b) => b.status === 'failed').length;
    const completedBuilds = builds.filter((b) => b.startedAt && b.completedAt);

    const averageBuildTime =
      completedBuilds.length > 0
        ? completedBuilds.reduce((sum, b) => {
            const duration =
              new Date(b.completedAt!).getTime() -
              new Date(b.startedAt!).getTime();
            return sum + duration;
          }, 0) / completedBuilds.length
        : 0;

    const successRate =
      totalBuilds > 0 ? (successfulBuilds / totalBuilds) * 100 : 0;
    const failureRate =
      totalBuilds > 0 ? (failedBuilds / totalBuilds) * 100 : 0;

    return {
      totalBuilds,
      successfulBuilds,
      failedBuilds,
      averageBuildTime,
      successRate,
      failureRate,
      buildsByTimeRange: this.groupBuildsByTimeRange(builds, config),
      buildsByModule: this.groupBuildsByModule(builds),
      buildsByUser: this.groupBuildsByUser(builds),
      statusDistribution: this.getStatusDistribution(builds),
      performanceMetrics: this.calculatePerformanceMetrics(builds),
    };
  }

  async getSummary(config: { timeRange: number }) {
    const analytics = await this.getAnalytics({
      timeRange: config.timeRange,
      groupBy: 'day',
    });

    return {
      totalBuilds: analytics.totalBuilds,
      successfulBuilds: analytics.successfulBuilds,
      failedBuilds: analytics.failedBuilds,
      successRate: analytics.successRate,
      failureRate: analytics.failureRate,
      averageBuildTime: analytics.averageBuildTime,
      topErrors: await this.getTopErrors(config.timeRange),
      recentBuilds: await this.mobileAppBuildRepository.find({
        take: 10,
        order: { createdAt: 'DESC' },
        relations: ['appDefinition'],
      }),
    };
  }

  private getValidSortField(sort: string): string {
    const validFields = [
      'id',
      'status',
      'createdAt',
      'updatedAt',
      'startedAt',
      'completedAt',
      'startedBy',
      'jenkinsBuildNumber',
      'durationMs',
      'buildType',
      'environment',
      'errorCategory',
      'buildStage',
      'isAutomated',
      'branchName',
    ];
    return validFields.includes(sort) ? sort : 'createdAt';
  }

  private groupBuildsByTimeRange(
    builds: MobileAppBuild[],
    config: AnalyticsConfig,
  ) {
    const grouped = new Map<
      string,
      { builds: number; successes: number; failures: number }
    >();

    builds.forEach((build) => {
      const date = this.getGroupingKey(build.createdAt, config.groupBy);
      const current = grouped.get(date) || {
        builds: 0,
        successes: 0,
        failures: 0,
      };

      current.builds++;
      if (build.status === 'completed') current.successes++;
      if (build.status === 'failed') current.failures++;

      grouped.set(date, current);
    });

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      builds: data.builds,
      successes: data.successes,
      failures: data.failures,
    }));
  }

  private groupBuildsByModule(builds: MobileAppBuild[]) {
    const grouped = new Map<
      string,
      { builds: number; successes: number; failures: number }
    >();

    builds.forEach((build) => {
      const module = build.appDefinition?.appModule || 'Unknown';
      const current = grouped.get(module) || {
        builds: 0,
        successes: 0,
        failures: 0,
      };

      current.builds++;
      if (build.status === 'completed') current.successes++;
      if (build.status === 'failed') current.failures++;

      grouped.set(module, current);
    });

    return Array.from(grouped.entries())
      .map(([module, data]) => ({
        module,
        builds: data.builds,
        successes: data.successes,
        failures: data.failures,
      }))
      .sort((a, b) => b.builds - a.builds);
  }

  private groupBuildsByUser(builds: MobileAppBuild[]) {
    const grouped = new Map<
      string,
      { builds: number; successes: number; failures: number }
    >();

    builds.forEach((build) => {
      const user = build.startedBy;
      const current = grouped.get(user) || {
        builds: 0,
        successes: 0,
        failures: 0,
      };

      current.builds++;
      if (build.status === 'completed') current.successes++;
      if (build.status === 'failed') current.failures++;

      grouped.set(user, current);
    });

    return Array.from(grouped.entries())
      .map(([user, data]) => ({
        user,
        builds: data.builds,
        successes: data.successes,
        failures: data.failures,
      }))
      .sort((a, b) => b.builds - a.builds);
  }

  private getStatusDistribution(builds: MobileAppBuild[]) {
    const statusCount = new Map<string, number>();

    builds.forEach((build) => {
      statusCount.set(build.status, (statusCount.get(build.status) || 0) + 1);
    });

    return Array.from(statusCount.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: builds.length > 0 ? (count / builds.length) * 100 : 0,
    }));
  }

  private calculatePerformanceMetrics(builds: MobileAppBuild[]) {
    const completedBuilds = builds.filter((b) => b.startedAt && b.completedAt);

    const buildsWithDuration = completedBuilds.map((build) => ({
      ...build,
      duration:
        new Date(build.completedAt!).getTime() -
        new Date(build.startedAt!).getTime(),
    }));

    const fastestBuild = buildsWithDuration.reduce(
      (fastest, build) => (build.duration < fastest.duration ? build : fastest),
      { id: '', duration: Infinity, appDefinition: { appName: '' } } as any,
    );

    const slowestBuild = buildsWithDuration.reduce(
      (slowest, build) => (build.duration > slowest.duration ? build : slowest),
      { id: '', duration: 0, appDefinition: { appName: '' } } as any,
    );

    const userCounts = this.groupBuildsByUser(builds);
    const mostActiveUser = userCounts[0] || {
      user: '',
      builds: 0,
      successes: 0,
      failures: 0,
    };

    const appCounts = new Map<string, number>();
    builds.forEach((build) => {
      const appName = build.appDefinition?.appName || 'Unknown';
      appCounts.set(appName, (appCounts.get(appName) || 0) + 1);
    });

    const mostBuiltApp = Array.from(appCounts.entries()).reduce(
      (most, [app, count]) =>
        count > most.buildCount ? { app, buildCount: count } : most,
      { app: '', buildCount: 0 },
    );

    return {
      fastestBuild: {
        id: fastestBuild.id,
        duration: fastestBuild.duration,
        appName: fastestBuild.appDefinition?.appName || 'Unknown',
      },
      slowestBuild: {
        id: slowestBuild.id,
        duration: slowestBuild.duration,
        appName: slowestBuild.appDefinition?.appName || 'Unknown',
      },
      mostActiveUser,
      mostBuiltApp,
    };
  }

  private async getTopErrors(timeRange: number) {
    const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);

    const failedBuilds = await this.mobileAppBuildRepository.find({
      where: {
        status: 'failed',
        createdAt: MoreThanOrEqual(startDate),
      },
      relations: ['appDefinition'],
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const errorCounts = new Map<
      string,
      { count: number; lastOccurrence: Date }
    >();

    failedBuilds.forEach((build) => {
      if (build.errorMessage) {
        const error = build.errorMessage.substring(0, 100); // Truncate for grouping
        const current = errorCounts.get(error) || {
          count: 0,
          lastOccurrence: new Date(0),
        };
        current.count++;
        current.lastOccurrence = new Date(
          Math.max(
            current.lastOccurrence.getTime(),
            new Date(build.createdAt).getTime(),
          ),
        );
        errorCounts.set(error, current);
      }
    });

    return Array.from(errorCounts.entries())
      .map(([error, data]) => ({
        error,
        count: data.count,
        lastOccurrence: data.lastOccurrence.toISOString(),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getGroupingKey(date: Date, groupBy: string): string {
    const d = new Date(date);

    switch (groupBy) {
      case 'day':
        return d.toISOString().split('T')[0];
      case 'week': {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().split('T')[0];
      }
      case 'month':
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }
}
