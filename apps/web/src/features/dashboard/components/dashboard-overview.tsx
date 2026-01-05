import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDashboardStats,
  useRecentActivity,
} from '../hooks/use-dashboard-data';
import { TrendingUp, Users, Smartphone, Activity, Package } from 'lucide-react';

const formatDateTime = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export function DashboardOverview() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    data: activities,
    isLoading: activitiesLoading,
    error: activitiesError,
  } = useRecentActivity();

  if (statsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  {i < 3 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statsError || activitiesError || !stats || !activities) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">載入儀表板資料失敗</p>
        </CardContent>
      </Card>
    );
  }
  const statCards = [
    {
      title: '應用程式總數',
      value: stats.totalApps.toLocaleString(),
      change: `+${stats.newAppsThisMonth} 本月新增`,
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '活躍設備',
      value: stats.activeDevices.toLocaleString(),
      change: '設備總數',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '版本更新',
      value: stats.versionUpdates.toLocaleString(),
      change: `${stats.versionGrowthRate}% 版本增長`,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '獨特用戶',
      value: stats.uniqueUsers.toLocaleString(),
      change: '應用程式用戶',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-normal text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900">
            最近活動
          </CardTitle>
          <CardDescription className="text-slate-600">
            最新用戶註冊和個人資料更新
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    activity.action === 'created'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.fullName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {activity.action === 'created'
                          ? '新增帳戶'
                          : '更新個人資料'}{' '}
                        • {activity.deptName}
                      </p>
                      <p className="text-xs text-slate-500">
                        @{activity.username}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatDateTime(activity.timestamp)}
                    </Badge>
                  </div>
                  {index < activities.length - 1 && (
                    <Separator className="mt-4 ml-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardOverviewComponent() {
  return <DashboardOverview />;
}
