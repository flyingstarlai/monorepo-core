import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { UnifiedPagination } from '@/components/ui/unified-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Smartphone,
} from 'lucide-react';
import type { MobileAppOverviewDto } from '@/lib/mobile-apps.service';

interface AppsDataTableProps {
  data?: MobileAppOverviewDto[];
  isLoading?: boolean;
  columns: ColumnDef<MobileAppOverviewDto>[];
}

export function AppsDataTable({
  data,
  isLoading,
  columns,
}: AppsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [appIdFilter, setAppIdFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const apps = data || [];
  const total = apps.length;

  // Optimized search function with memoization
  const filteredApps = useMemo(() => {
    if (!globalFilter && appIdFilter === 'all' && activeFilter === 'all') {
      return apps;
    }

    return apps.filter((app) => {
      // Global search filter
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase();
        const matchesAppName = app.appName.toLowerCase().includes(searchLower);
        const matchesAppId = app.appId.toLowerCase().includes(searchLower);
        const matchesLatestVersion = app.latestVersion
          ?.toLowerCase()
          .includes(searchLower);

        if (!matchesAppName && !matchesAppId && !matchesLatestVersion) {
          return false;
        }
      }

      // App ID filter
      if (appIdFilter && appIdFilter !== 'all' && app.appId !== appIdFilter) {
        return false;
      }

      // Active status filter
      if (
        activeFilter !== 'all' &&
        (activeFilter === 'true'
          ? app.activeDevices > 0
          : app.activeDevices === 0)
      ) {
        return false;
      }

      return true;
    });
  }, [apps, globalFilter, appIdFilter, activeFilter]);

  const table = useReactTable({
    data: filteredApps,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPaginationState,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: paginationState,
    },
  });

  const handlePageChange = (newPageIndex: number) => {
    setPaginationState((prev) => ({ ...prev, pageIndex: newPageIndex }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPaginationState((prev) => ({
      ...prev,
      pageSize: newPageSize,
      pageIndex: 0, // Reset to first page when changing page size
    }));
  };

  // Client-side search only - no API calls needed
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value); // Update UI immediately for responsive typing
    // Client-side search only - no API calls needed
  };

  // Memoized filtered count for performance
  const filteredCount = useMemo(() => filteredApps.length, [filteredApps]);

  // Search state for UX feedback
  const isSearching = globalFilter && globalFilter.trim().length > 0;

  // Pagination calculations
  const currentPage = paginationState.pageIndex + 1;
  const pageSize = paginationState.pageSize;
  const totalPages = Math.ceil(filteredCount / pageSize);

  const handleAppIdFilterChange = (value: string) => {
    setAppIdFilter(value);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setAppIdFilter('all');
    setActiveFilter('all');
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  // Get unique app IDs for filter dropdown
  const uniqueAppIds = useMemo(() => {
    const ids = [...new Set(apps.map((app) => app.appId))];
    return ids.sort();
  }, [apps]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-2 border-b"
                >
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Compact Header with Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">應用程式</span>
              <Badge variant="secondary" className="text-xs">
                {filteredCount} / {total}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋應用程式..."
                  value={globalFilter ?? ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-48 h-9 text-sm"
                  key="search-input" // Stable key to prevent re-renders
                />
              </div>

              {/* App ID Filter */}
              <Select
                value={appIdFilter}
                onValueChange={handleAppIdFilterChange}
              >
                <SelectTrigger className="w-32 h-9 text-sm">
                  <SelectValue placeholder="應用程式 ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有 ID</SelectItem>
                  {uniqueAppIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Active Status Filter */}
              <Select
                value={activeFilter}
                onValueChange={handleActiveFilterChange}
              >
                <SelectTrigger className="w-32 h-9 text-sm">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有狀態</SelectItem>
                  <SelectItem value="true">有活躍設備</SelectItem>
                  <SelectItem value="false">無活躍設備</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-9 text-sm"
              >
                <Filter className="h-4 w-4 mr-1" />
                清除
              </Button>
            </div>
          </div>

          {/* Compact Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none flex items-center space-x-1'
                                : ''
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getCanSort() && (
                              <span className="ml-1">
                                {header.column.getIsSorted() === 'desc' ? (
                                  <ArrowDown className="h-3 w-3" />
                                ) : header.column.getIsSorted() === 'asc' ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Smartphone className="h-8 w-8 text-muted-foreground/50" />
                        <span>
                          {isSearching ? '搜尋中...' : '找不到符合的應用程式'}
                        </span>
                        {isSearching && (
                          <span className="text-sm text-muted-foreground">
                            正在搜尋 "{globalFilter}"
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Compact Pagination */}
          <UnifiedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredCount}
            onPageChange={(page) => handlePageChange(page - 1)}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
