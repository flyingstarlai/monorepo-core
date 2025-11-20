import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { UnifiedPagination } from '@/components/ui/unified-pagination';

interface UserLoginHistoryProps {
  userId: string;
}

interface LoginLogItem {
  logId: string;
  loginAt: string | null;
  success: boolean;
  failureReason: string | null;
  deviceId: string | null;
  appName: string | null;
  appVersion: string | null;
  appModule: string | null;
}

interface LoginHistoryResponse {
  items: LoginLogItem[];
}

export function UserLoginHistory({ userId }: UserLoginHistoryProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-login-history', userId],
    queryFn: async () => {
      const response = await apiClient.get<LoginHistoryResponse>(
        `/users/${userId}/login-history?limit=1000`,
      );
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((item) => {
      // Global search filter
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase();
        const matchesLoginTime = item.loginAt
          ?.toLowerCase()
          .includes(searchLower);
        const matchesFailureReason = item.failureReason
          ?.toLowerCase()
          .includes(searchLower);
        const matchesDeviceId = item.deviceId
          ?.toLowerCase()
          .includes(searchLower);
        const matchesAppName = item.appName
          ?.toLowerCase()
          .includes(searchLower);
        const matchesAppVersion = item.appVersion
          ?.toLowerCase()
          .includes(searchLower);
        const matchesAppModule = item.appModule
          ?.toLowerCase()
          .includes(searchLower);

        if (
          !matchesLoginTime &&
          !matchesFailureReason &&
          !matchesDeviceId &&
          !matchesAppName &&
          !matchesAppVersion &&
          !matchesAppModule
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const isSuccess = statusFilter === 'true';
        if (item.success !== isSuccess) {
          return false;
        }
      }

      return true;
    });
  }, [data?.items, globalFilter, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  if (error) {
    return (
      <div className="text-destructive text-sm p-6">
        載入登入歷史時發生錯誤: {error.message}
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">行動登入歷史</h2>
        </div>
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">登入時間</TableHead>
                <TableHead className="w-16">狀態</TableHead>
                <TableHead className="w-32">失敗原因</TableHead>
                <TableHead className="w-32">裝置 ID</TableHead>
                <TableHead className="w-32">應用程式</TableHead>
                <TableHead className="w-24">版本</TableHead>
                <TableHead className="w-24">模組</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">行動登入歷史</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜尋登入記錄..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="true">成功</SelectItem>
              <SelectItem value="false">失敗</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">登入時間</TableHead>
              <TableHead className="w-16">狀態</TableHead>
              <TableHead className="w-32">失敗原因</TableHead>
              <TableHead className="w-32">裝置 ID</TableHead>
              <TableHead className="w-32">應用程式</TableHead>
              <TableHead className="w-24">版本</TableHead>
              <TableHead className="w-24">模組</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="text-slate-500">
                    {globalFilter ? '找不到符合條件的記錄' : '無登入歷史記錄'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="text-sm font-medium text-slate-900">
                    {row.loginAt || '—'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.success
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.success ? '成功' : '失敗'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {row.failureReason || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {row.deviceId || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {row.appName || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {row.appVersion || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {row.appModule || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.items.length > 0 && (
        <UnifiedPagination
          currentPage={page}
          totalPages={Math.ceil((filteredData?.length || 0) / pageSize)}
          pageSize={pageSize}
          totalItems={filteredData?.length || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
