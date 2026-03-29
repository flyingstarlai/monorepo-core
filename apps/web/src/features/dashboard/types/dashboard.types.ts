export interface DashboardStats {
  totalUsers: number;
  adminCount: number;
}

export interface RecentActivity {
  id: string;
  username: string;
  fullName: string;
  action: 'created' | 'updated';
  timestamp: string;
}
