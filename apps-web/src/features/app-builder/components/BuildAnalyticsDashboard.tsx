import { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
// Progress component might not be available, we'll create a simple one
const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
// For now, we'll use simple div-based charts until recharts is installed
// Chart components will be replaced with actual recharts components when available
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';
import type {
  MobileAppBuild,
  MobileAppDefinition,
  DashboardModule,
} from '../types';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface BuildAnalyticsDashboardProps {
  builds: MobileAppBuild[];
  definitions: MobileAppDefinition[];
  modules: DashboardModule[];
}

interface TimeRange {
  label: string;
  value: number; // days
}

interface AnalyticsData {
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  averageBuildTime: number;
  successRate: number;
  failureRate: number;
  buildsByDay: Array<{
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
  buildTimeTrend: Array<{ date: string; avgTime: number; buildId: string }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  topErrors: Array<{ error: string; count: number; lastOccurrence: string }>;
  performanceMetrics: {
    fastestBuild: { id: string; duration: number; appName: string };
    slowestBuild: { id: string; duration: number; appName: string };
    mostActiveUser: { user: string; buildCount: number };
    mostBuiltApp: { app: string; buildCount: number };
  };
}

const timeRanges: TimeRange[] = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'Last year', value: 365 },
];

const statusColors = {
  completed: '#10b981',
  failed: '#ef4444',
  building: '#3b82f6',
  queued: '#f59e0b',
  cancelled: '#6b7280',
};

const chartColors = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

function calculateBuildDuration(build: MobileAppBuild): number {
  if (!build.startedAt) return 0;
  const endTime = build.completedAt
    ? new Date(build.completedAt).getTime()
    : Date.now();
  const startTime = new Date(build.startedAt).getTime();
  return endTime - startTime;
}

function extractErrorMessage(errorMessage?: string): string {
  if (!errorMessage) return 'No error message';

  // Try to extract a concise error message
  const lines = errorMessage.split('\n');
  const firstErrorLine = lines.find(
    (line) =>
      line.includes('ERROR') ||
      line.includes('FAILED') ||
      line.includes('Exception') ||
      line.includes('BUILD FAILED'),
  );

  if (firstErrorLine) {
    return firstErrorLine.trim().substring(0, 100);
  }

  return errorMessage.substring(0, 100);
}

export function BuildAnalyticsDashboard({
  builds,
  definitions,
  modules,
}: BuildAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(timeRanges[1]); // 30 days
  const [activeTab, setActiveTab] = useState('overview');

  const definitionMap = useMemo(() => {
    const map = new Map<string, MobileAppDefinition>();
    definitions.forEach((def) => map.set(def.id, def));
    return map;
  }, [definitions]);

  const moduleMap = useMemo(() => {
    const map = new Map<string, string>();
    modules.forEach((module) => map.set(module.id, module.name));
    return map;
  }, [modules]);

  const analyticsData = useMemo((): AnalyticsData => {
    const now = new Date();
    const startDate = startOfDay(subDays(now, timeRange.value));
    const endDate = endOfDay(now);

    const filteredBuilds = builds.filter((build) => {
      const buildDate = new Date(build.createdAt);
      return buildDate >= startDate && buildDate <= endDate;
    });

    const enrichedBuilds = filteredBuilds.map((build) => ({
      ...build,
      definition: definitionMap.get(build.appDefinitionId),
      moduleName: moduleMap.get(build.definition?.appModule || '') || 'Unknown',
      duration: calculateBuildDuration(build),
    }));

    // Basic metrics
    const totalBuilds = enrichedBuilds.length;
    const successfulBuilds = enrichedBuilds.filter(
      (b) => b.status === 'completed',
    ).length;
    const failedBuilds = enrichedBuilds.filter(
      (b) => b.status === 'failed',
    ).length;
    const completedBuilds = enrichedBuilds.filter(
      (b) => b.startedAt && b.completedAt,
    );
    const averageBuildTime =
      completedBuilds.length > 0
        ? completedBuilds.reduce(
            (sum, b) => sum + calculateBuildDuration(b),
            0,
          ) / completedBuilds.length
        : 0;

    // Success rate
    const successRate =
      totalBuilds > 0 ? (successfulBuilds / totalBuilds) * 100 : 0;
    const failureRate =
      totalBuilds > 0 ? (failedBuilds / totalBuilds) * 100 : 0;

    // Builds by day
    const buildsByDay = new Map<
      string,
      { builds: number; successes: number; failures: number }
    >();
    for (let i = timeRange.value - 1; i >= 0; i--) {
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      buildsByDay.set(date, { builds: 0, successes: 0, failures: 0 });
    }

    enrichedBuilds.forEach((build) => {
      const date = format(new Date(build.createdAt), 'yyyy-MM-dd');
      const current = buildsByDay.get(date) || {
        builds: 0,
        successes: 0,
        failures: 0,
      };

      current.builds++;
      if (build.status === 'completed') current.successes++;
      if (build.status === 'failed') current.failures++;

      buildsByDay.set(date, current);
    });

    const buildsByDayArray = Array.from(buildsByDay.entries()).map(
      ([date, data]) => ({
        date: format(new Date(date), 'MMM dd'),
        builds: data.builds,
        successes: data.successes,
        failures: data.failures,
      }),
    );

    // Builds by module
    const buildsByModule = new Map<
      string,
      { builds: number; successes: number; failures: number }
    >();
    enrichedBuilds.forEach((build) => {
      const current = buildsByModule.get(build.moduleName) || {
        builds: 0,
        successes: 0,
        failures: 0,
      };

      current.builds++;
      if (build.status === 'completed') current.successes++;
      if (build.status === 'failed') current.failures++;

      buildsByModule.set(build.moduleName, current);
    });

    const buildsByModuleArray = Array.from(buildsByModule.entries())
      .map(([module, data]) => ({
        module,
        builds: data.builds,
        successes: data.successes,
        failures: data.failures,
      }))
      .sort((a, b) => b.builds - a.builds);

    // Builds by user
    const buildsByUser = new Map<
      string,
      { builds: number; successes: number; failures: number }
    >();
    enrichedBuilds.forEach((build) => {
      const current = buildsByUser.get(build.startedBy) || {
        builds: 0,
        successes: 0,
        failures: 0,
      };

      current.builds++;
      if (build.status === 'completed') current.successes++;
      if (build.status === 'failed') current.failures++;

      buildsByUser.set(build.startedBy, current);
    });

    const buildsByUserArray = Array.from(buildsByUser.entries())
      .map(([user, data]) => ({
        user,
        builds: data.builds,
        successes: data.successes,
        failures: data.failures,
      }))
      .sort((a, b) => b.builds - a.builds)
      .slice(0, 10); // Top 10 users

    // Build time trend
    const buildTimeTrend = completedBuilds
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map((build) => ({
        date: format(new Date(build.createdAt), 'MMM dd'),
        avgTime: calculateBuildDuration(build) / 1000, // Convert to seconds
        buildId: build.id.slice(-8),
      }))
      .slice(-30); // Last 30 builds

    // Status distribution
    const statusCount = new Map<string, number>();
    enrichedBuilds.forEach((build) => {
      statusCount.set(build.status, (statusCount.get(build.status) || 0) + 1);
    });

    const statusDistribution = Array.from(statusCount.entries()).map(
      ([status, count]) => ({
        status,
        count,
        percentage: totalBuilds > 0 ? (count / totalBuilds) * 100 : 0,
      }),
    );

    // Top errors
    const errorCount = new Map<
      string,
      { count: number; lastOccurrence: Date }
    >();
    enrichedBuilds.forEach((build) => {
      if (build.errorMessage) {
        const error = extractErrorMessage(build.errorMessage);
        const current = errorCount.get(error) || {
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
        errorCount.set(error, current);
      }
    });

    const topErrors = Array.from(errorCount.entries())
      .map(([error, data]) => ({
        error,
        count: data.count,
        lastOccurrence: format(data.lastOccurrence, 'MMM dd, yyyy'),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Performance metrics
    const completedWithDuration = completedBuilds.filter(
      (b) => calculateBuildDuration(b) > 0,
    );
    const fastestBuild = completedWithDuration.reduce(
      (fastest, build) => {
        const duration = calculateBuildDuration(build);
        return duration < fastest.duration
          ? {
              id: build.id,
              duration,
              appName: build.definition?.appName || 'Unknown',
            }
          : fastest;
      },
      { id: '', duration: Infinity, appName: '' },
    );

    const slowestBuild = completedWithDuration.reduce(
      (slowest, build) => {
        const duration = calculateBuildDuration(build);
        return duration > slowest.duration
          ? {
              id: build.id,
              duration,
              appName: build.definition?.appName || 'Unknown',
            }
          : slowest;
      },
      { id: '', duration: 0, appName: '' },
    );

    const mostActiveUser = Array.from(buildsByUser.entries()).reduce(
      (most, [user, data]) =>
        data.builds > most.buildCount
          ? { user, buildCount: data.builds }
          : most,
      { user: '', buildCount: 0 },
    );

    const mostBuiltApp = new Map<string, number>();
    enrichedBuilds.forEach((build) => {
      const appName = build.definition?.appName || 'Unknown';
      mostBuiltApp.set(appName, (mostBuiltApp.get(appName) || 0) + 1);
    });

    const topApp = Array.from(mostBuiltApp.entries()).reduce(
      (most, [app, count]) =>
        count > most.buildCount ? { app, buildCount: count } : most,
      { app: '', buildCount: 0 },
    );

    return {
      totalBuilds,
      successfulBuilds,
      failedBuilds,
      averageBuildTime,
      successRate,
      failureRate,
      buildsByDay: buildsByDayArray,
      buildsByModule: buildsByModuleArray,
      buildsByUser: buildsByUserArray,
      buildTimeTrend,
      statusDistribution,
      topErrors,
      performanceMetrics: {
        fastestBuild:
          fastestBuild.duration !== Infinity
            ? fastestBuild
            : { id: '', duration: 0, appName: 'N/A' },
        slowestBuild,
        mostActiveUser,
        mostBuiltApp: topApp,
      },
    };
  }, [builds, definitions, modules, timeRange, definitionMap, moduleMap]);

  const exportData = () => {
    const data = {
      timeRange: timeRange.label,
      generatedAt: new Date().toISOString(),
      analytics: analyticsData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Build Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights and metrics for your build process
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select
            value={timeRange.value.toString()}
            onValueChange={(value) => {
              const range = timeRanges.find((r) => r.value === Number(value));
              if (range) setTimeRange(range);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value.toString()}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Builds
                </p>
                <p className="text-2xl font-bold">
                  {analyticsData.totalBuilds}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {analyticsData.successRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={analyticsData.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Build Time
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(analyticsData.averageBuildTime / 60000)}m{' '}
                  {Math.round((analyticsData.averageBuildTime % 60000) / 1000)}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Failed Builds
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {analyticsData.failedBuilds}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <Progress value={analyticsData.failureRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Build Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUpIcon className="h-5 w-5" />
                <span>Build Trends Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 border rounded-lg p-4">
                <div className="text-center text-muted-foreground">
                  <p>Build trends chart</p>
                  <p className="text-sm">
                    Total: {analyticsData.totalBuilds}, Success:{' '}
                    {analyticsData.successfulBuilds}, Failed:{' '}
                    {analyticsData.failedBuilds}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module and User Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Builds by Module</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 border rounded-lg p-4">
                  <div className="text-center text-muted-foreground">
                    <p>Module distribution</p>
                    <div className="mt-2 space-y-1">
                      {analyticsData.buildsByModule
                        .slice(0, 5)
                        .map((module, index) => (
                          <div
                            key={module.module}
                            className="flex justify-between text-sm"
                          >
                            <span>{module.module}</span>
                            <span>{module.builds} builds</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Status Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 border rounded-lg p-4">
                  <div className="text-center text-muted-foreground">
                    <p>Status distribution</p>
                    <div className="mt-2 space-y-1">
                      {analyticsData.statusDistribution.map((status) => (
                        <div
                          key={status.status}
                          className="flex justify-between text-sm"
                        >
                          <span>{status.status}</span>
                          <span>
                            {status.count} ({status.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Build Time Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Build Time Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 border rounded-lg p-4">
                <div className="text-center text-muted-foreground">
                  <p>Build time trend</p>
                  <p className="text-sm">
                    Average:{' '}
                    {Math.round(analyticsData.averageBuildTime / 60000)}m{' '}
                    {Math.round(
                      (analyticsData.averageBuildTime % 60000) / 1000,
                    )}
                    s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle>Most Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.buildsByUser.slice(0, 10).map((user, index) => (
                  <div
                    key={user.user}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="font-medium">{user.user}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{user.builds} builds</div>
                      <div className="text-sm text-muted-foreground">
                        {user.successes} successful, {user.failures} failed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Fastest Build</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Build ID:
                    </span>
                    <span className="font-mono">
                      {analyticsData.performanceMetrics.fastestBuild.id.slice(
                        -8,
                      ) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">App:</span>
                    <span>
                      {analyticsData.performanceMetrics.fastestBuild.appName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Duration:
                    </span>
                    <span className="font-medium text-green-600">
                      {Math.round(
                        analyticsData.performanceMetrics.fastestBuild.duration /
                          60000,
                      )}
                      m{' '}
                      {Math.round(
                        (analyticsData.performanceMetrics.fastestBuild
                          .duration %
                          60000) /
                          1000,
                      )}
                      s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span>Slowest Build</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Build ID:
                    </span>
                    <span className="font-mono">
                      {analyticsData.performanceMetrics.slowestBuild.id.slice(
                        -8,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">App:</span>
                    <span>
                      {analyticsData.performanceMetrics.slowestBuild.appName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Duration:
                    </span>
                    <span className="font-medium text-red-600">
                      {Math.round(
                        analyticsData.performanceMetrics.slowestBuild.duration /
                          60000,
                      )}
                      m{' '}
                      {Math.round(
                        (analyticsData.performanceMetrics.slowestBuild
                          .duration %
                          60000) /
                          1000,
                      )}
                      s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Module Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.buildsByModule.map((module) => {
                  const successRate =
                    module.builds > 0
                      ? (module.successes / module.builds) * 100
                      : 0;
                  return (
                    <div
                      key={module.module}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{module.module}</div>
                        <div className="text-sm text-muted-foreground">
                          {module.builds} builds total
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {successRate.toFixed(1)}% success
                        </div>
                        <Progress value={successRate} className="mt-1 w-24" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Error Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Common Errors</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.topErrors.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.topErrors.map((error, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">
                            {error.count} occurrences
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Last: {error.lastOccurrence}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-mono bg-muted p-2 rounded">
                        {error.error}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No errors found in the selected time range
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Best Performing Module</div>
                    <div className="text-sm text-muted-foreground">
                      {analyticsData.buildsByModule.length > 0 &&
                        `${analyticsData.buildsByModule[0].module} with ${analyticsData.buildsByModule[0].successes} successful builds`}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Most Active User</div>
                    <div className="text-sm text-muted-foreground">
                      {analyticsData.performanceMetrics.mostActiveUser.user}{' '}
                      with{' '}
                      {
                        analyticsData.performanceMetrics.mostActiveUser
                          .buildCount
                      }{' '}
                      builds
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Most Built App</div>
                    <div className="text-sm text-muted-foreground">
                      {analyticsData.performanceMetrics.mostBuiltApp.app} with{' '}
                      {analyticsData.performanceMetrics.mostBuiltApp.buildCount}{' '}
                      builds
                    </div>
                  </div>
                </div>

                {analyticsData.successRate < 80 && (
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-600">
                        Success Rate Alert
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Success rate is below 80%. Consider reviewing build
                        configurations and common errors.
                      </div>
                    </div>
                  </div>
                )}

                {analyticsData.averageBuildTime > 600000 && ( // 10 minutes
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-600">
                        Build Performance Alert
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average build time exceeds 10 minutes. Consider
                        optimizing the build process.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
