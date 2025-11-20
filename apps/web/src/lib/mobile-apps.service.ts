import { apiClient } from './api-client';

export interface MobileAppOverviewDto {
  appId: string;
  appName: string;
  latestVersion: string | null;
  versions: string[];
  activeDevices: number;
  totalDevices: number;
  uniqueUsers: number;
  companies: number;
}

export async function getMobileAppsOverview(): Promise<MobileAppOverviewDto[]> {
  const response = await apiClient.get('/mobile-apps');
  return response.data;
}
