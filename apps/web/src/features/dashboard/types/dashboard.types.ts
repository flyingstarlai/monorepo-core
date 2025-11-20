export interface DashboardStats {
  // App-focused metrics
  totalApps: number;
  activeDevices: number;
  versionUpdates: number;
  uniqueUsers: number;

  // Growth metrics
  versionGrowthRate: number;
  newAppsThisMonth: number;

  // Keep some user context
  totalDepartments: number;
}

export interface RecentActivity {
  id: string;
  username: string;
  fullName: string;
  deptName: string;
  action: 'created' | 'updated';
  timestamp: string;
}
