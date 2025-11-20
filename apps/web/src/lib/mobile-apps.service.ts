import { apiClient } from './api-client';
import { getLatestVersion, getVersionStatus } from './version-comparison.utils';

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
