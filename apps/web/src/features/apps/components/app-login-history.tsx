import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getLoginHistoryByAppId,
  type LoginHistoryQueryParams,
} from '@/lib/mobile-apps.service';
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
import { UnifiedPagination } from '@/components/ui/unified-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ArrowLeft, Filter, Smartphone } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { formatDate } from '@/features/users/utils/user-transformers.ts';

interface AppLoginHistoryProps {
  appId: string;
}

export function AppLoginHistory({ appId }: AppLoginHistoryProps) {
  const [filters, setFilters] = useState<LoginHistoryQueryParams>({
    page: 1,
    limit: 50,
  });

  const {
    data: loginHistoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['login-history', appId, filters],
    queryFn: () => getLoginHistoryByAppId(appId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleDateRangeChange = (range?: { from?: Date; to?: Date }) => {
    setFilters((prev) => ({
      ...prev,
      startDate: range?.from?.toISOString(),
      endDate: range?.to?.toISOString(),
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handlePageSizeChange = (limit: number) => {
    setFilters((prev) => ({
      ...prev,
      limit,
      page: 1,
    }));
  };

  const dateRangeValue = useMemo(() => {
    if (!filters.startDate && !filters.endDate) return undefined;
    return {
      from: filters.startDate ? new Date(filters.startDate) : undefined,
      to: filters.endDate ? new Date(filters.endDate) : undefined,
    };
  }, [filters.startDate, filters.endDate]);

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
              <h1 className="text-3xl font-bold text-slate-900">登入歷史</h1>
              <p className="text-slate-600 mt-2">應用程式 ID: {appId}</p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">載入登入歷史失敗</p>
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

  const { data, pagination } = loginHistoryData || {
    data: [],
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };

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
            <h1 className="text-3xl font-bold text-slate-900">登入歷史</h1>
            <p className="text-slate-600 mt-2">應用程式 ID: {appId}</p>
          </div>
        </div>
        {pagination.total > 0 && (
          <Badge variant="secondary" className="text-sm">
            共 {pagination.total} 筆記錄
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>篩選條件</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <DateRangePicker
                value={dateRangeValue}
                onChange={handleDateRangeChange}
                placeholder="選擇日期範圍"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => handleDateRangeChange(undefined)}
            >
              清除篩選
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login History Table */}
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
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Smartphone className="h-12 w-12" />
                </EmptyMedia>
              </EmptyHeader>
              <EmptyTitle>
                {filters.startDate || filters.endDate
                  ? '在指定時間範圍內沒有找到登入記錄'
                  : '沒有找到登入記錄'}
              </EmptyTitle>
              <EmptyDescription>
                {filters.startDate || filters.endDate
                  ? '請調整篩選條件後重試'
                  : '此應用程式暫無登入記錄'}
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-24 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      應用程式 ID
                    </TableHead>
                    <TableHead className="w-32 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      應用程式名稱
                    </TableHead>
                    <TableHead className="w-24 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      用戶名稱
                    </TableHead>
                    <TableHead className="w-16 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      登入狀態
                    </TableHead>
                    <TableHead className="w-32 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      失敗原因
                    </TableHead>
                    <TableHead className="w-28 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      登入時間
                    </TableHead>
                    <TableHead className="w-24 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      登入時版本
                    </TableHead>
                    <TableHead className="w-24 py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      登入時模組
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((record) => (
                    <TableRow
                      key={record.key}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="py-3 px-4 font-mono text-sm">
                        {record.appId || '-'}
                      </TableCell>
                      <TableCell className="py-3 px-4 font-medium text-slate-900">
                        {record.appName || '-'}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-900">
                        {record.username}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Badge
                          variant={record.success ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {record.success ? '成功' : '失敗'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          'py-3 px-4 text-sm',
                          record.failureReason
                            ? 'text-red-600'
                            : 'text-slate-600',
                        )}
                      >
                        {record.failureReason || '-'}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-600">
                        {formatDate(new Date(record.loginAt))}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-600">
                        {record.appVersion || '-'}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-slate-600">
                        {record.appModule || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && data.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <UnifiedPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.limit}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
