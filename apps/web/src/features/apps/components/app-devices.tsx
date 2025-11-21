import { useQuery } from '@tanstack/react-query';
import { getDevicesByAppId } from '@/lib/mobile-apps.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Smartphone, Activity, History } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';

interface AppDevicesProps {
  appId: string;
  appName?: string;
}

export function AppDevices({ appId, appName }: AppDevicesProps) {
  const {
    data: devices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['app-devices', appId, appName],
    queryFn: () => getDevicesByAppId(appId, appName),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/apps">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回應用程式
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">設備列表</h1>
              <p className="text-slate-600 mt-2">
                應用程式 ID: {appId}
                {appName && ` | 應用程式名稱: ${appName}`}
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">載入設備列表失敗</p>
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

  const activeDevices = devices.filter((device) => device.isActive).length;
  const totalDevices = devices.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/apps">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回應用程式
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">設備列表</h1>
            <p className="text-slate-600 mt-2">
              應用程式 ID: {appId}
              {appName && ` | 應用程式名稱: ${appName}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            總設備數: {totalDevices}
          </Badge>
          <Badge
            variant="default"
            className="text-sm bg-green-100 text-green-800"
          >
            活躍設備: {activeDevices}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總設備數</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活躍設備</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeDevices}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-2 border-b"
                >
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : devices.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Smartphone className="h-12 w-12" />
                </EmptyMedia>
              </EmptyHeader>
              <EmptyTitle>沒有找到設備</EmptyTitle>
              <EmptyDescription>此應用程式暫無已註冊的設備</EmptyDescription>
            </Empty>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-24 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      設備 ID
                    </TableHead>
                    <TableHead className="w-24 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      應用程式版本
                    </TableHead>
                    <TableHead className="w-16 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      狀態
                    </TableHead>
                    <TableHead className="w-24 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      應用程式名稱
                    </TableHead>
                    <TableHead className="w-16 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow
                      key={device.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-3 px-4 font-mono text-sm">
                        {device.id}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-600">
                        {device.appVersion || '-'}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            device.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {device.isActive ? '活躍' : '非活躍'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-600">
                        {device.appName}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Link
                          to="/apps/$appId/logins"
                          params={{ appId: device.appId }}
                          search={{
                            deviceId: device.id,
                            ...(device.appName && { appName: device.appName }),
                          }}
                        >
                          <Button variant="outline" size="sm">
                            <History className="h-4 w-4 mr-2" />
                            查看歷史
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
