import { apiClient } from './api-client';
import { getLatestVersion, getVersionStatus } from './version-comparison.utils';

export interface LoginHistoryRecord {
  key: string;
  username: string;
  appId: string;
  success: boolean;
  failureReason: string | null;
  loginAt: string;
  accountId: string | null;
  appName: string | null;
  appVersion: string | null;
  appModule: string | null;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoginHistoryQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedLoginHistoryResponse {
  data: LoginHistoryRecord[];
  pagination: PaginationMetadata;
}

export interface MobileAppOverviewDto {
  appId: string;
  appName: string;
  latestVersion: string | null;
  actualLatestVersion: string | null;
  versions: string[];
  activeDevices: number;
  totalDevices: number;
  companies: number;
  uniqueUsers: number;
  // Enhanced version status fields
  versionStatus?: 'latest' | 'outdated' | 'critical' | 'unknown';
  versionsBehind?: number;
  updateRequired?: boolean;
}

export async function getMobileAppsOverview(): Promise<MobileAppOverviewDto[]> {
  const response = await apiClient.get('/mobile-apps');
  const apps = response.data as MobileAppOverviewDto[];

  // Use server-provided global latest version when available to keep it stable across UI filters
  const globalLatestVersion =
    apps[0]?.actualLatestVersion ?? getLatestVersion(apps);

  return apps.map((app) => {
    const status = getVersionStatus(app.latestVersion, globalLatestVersion);
    return {
      ...app,
      versionStatus: status.status,
      versionsBehind: status.versionsBehind,
      updateRequired: status.status !== 'latest' && status.status !== 'unknown',
    };
  });
}

export async function getLoginHistoryByAppId(
  appId: string,
  params?: LoginHistoryQueryParams,
): Promise<PaginatedLoginHistoryResponse> {
  const response = await apiClient.get(`/mobile-apps/${appId}/login-history`, {
    params,
  });
  return response.data as PaginatedLoginHistoryResponse;
}
