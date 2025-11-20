import { apiClient } from './api-client';
import { getLatestVersion, getVersionStatus } from './version-comparison.utils';

export interface MobileAppOverviewDto {
  appId: string;
  appName: string;
  latestVersion: string | null;
  versions: string[];
  activeDevices: number;
  totalDevices: number;
  companies: number;
  // Enhanced version status fields
  versionStatus?: 'latest' | 'outdated' | 'critical' | 'unknown';
  versionsBehind?: number;
  updateRequired?: boolean;
}

export async function getMobileAppsOverview(): Promise<MobileAppOverviewDto[]> {
  const response = await apiClient.get('/mobile-apps');
  const apps = response.data as MobileAppOverviewDto[];

  // Enhance with version status information
  const latestVersion = getLatestVersion(apps);

  return apps.map((app) => {
    const status = getVersionStatus(app.latestVersion, latestVersion);
    return {
      ...app,
      versionStatus: status.status,
      versionsBehind: status.versionsBehind,
      updateRequired: status.status !== 'latest' && status.status !== 'unknown',
    };
  });
}
