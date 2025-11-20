export interface MobileAppOverviewDto {
  appId: string;
  appName: string;
  latestVersion: string | null;
  actualLatestVersion: string | null;
  versions: string[];
  activeDevices: number;
  totalDevices: number;
  uniqueUsers: number;
  companies: number;
}
