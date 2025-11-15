export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  newUsersThisMonth: number;
  growthRate: number;
}

export interface RecentActivity {
  id: string;
  username: string;
  fullName: string;
  deptName: string;
  action: 'created' | 'updated';
  timestamp: string;
}
