import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Smartphone, Activity, Package } from 'lucide-react';
import { getMobileAppsOverview } from '@/lib/mobile-apps.service';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppsDataTable } from '@/features/apps/apps-data-table';
import { appsColumns } from '@/features/apps/apps-columns';

export const Route = createFileRoute('/_authenticated/apps/')({
  component: AppsIndexPage,
});

function AppsIndexPage() {
  const {
    data: apps = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['apps'],
    queryFn: getMobileAppsOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">應用程式概覽</h1>
            <p className="text-slate-600 mt-2">
              檢視已連接的應用程式及其使用統計。
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-4 bg-muted rounded"></div>
                <div className="h-4 w-12 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">應用程式概覽</h1>
            <p className="text-slate-600 mt-2">
              檢視已連接的應用程式及其使用統計。
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">載入行動應用程式資料失敗</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-2"
                variant="outline"
              >
                重試
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const totalApps = apps.length;
  const totalDevices = apps.reduce((sum, app) => sum + app.totalDevices, 0);
  const totalActiveDevices = apps.reduce(
    (sum, app) => sum + app.activeDevices,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">應用程式概覽</h1>
          <p className="text-slate-600 mt-2">
            檢視已連接的應用程式及其使用統計。
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">應用程式總數</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活躍設備</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalActiveDevices}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">設備總數</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Apps Table */}
      <AppsDataTable data={apps} isLoading={isLoading} columns={appsColumns} />
    </div>
  );
}
