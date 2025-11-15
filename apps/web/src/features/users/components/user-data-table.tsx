import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState, useCallback, useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Users,
  Loader2,
} from 'lucide-react';
import type { User, UsersResponse, UsersFilters } from '../types/user.types';

interface UserDataTableProps {
  data?: UsersResponse;
  isLoading?: boolean;
  columns: ColumnDef<User>[];
  filters?: UsersFilters;
  onFiltersChange?: (filters: UsersFilters) => void;
  onPaginationChange?: (page: number, limit: number) => void;
}

export function UserDataTable({
  data,
  isLoading,
  columns,
  filters = {},
  onFiltersChange,
  onPaginationChange,
}: UserDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState(filters.search || '');

  const users = data?.users || [];
  const total = data?.total || 0;
  const currentPage = data?.page || 1;
  const limit = data?.limit || 10;
  const totalPages = data?.totalPages || 1;

  // Optimized search function with memoization
  const filteredUsers = useMemo(() => {
    if (!globalFilter && !filters.role && !filters.isActive) {
      return users;
    }

    return users.filter((user) => {
      // Global search filter
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase();
        const matchesUsername = user.username
          .toLowerCase()
          .includes(searchLower);
        const matchesFullName = user.fullName
          .toLowerCase()
          .includes(searchLower);
        const matchesDeptName = user.deptName
          .toLowerCase()
          .includes(searchLower);

        if (!matchesUsername && !matchesFullName && !matchesDeptName) {
          return false;
        }
      }

      // Role filter
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // Status filter
      if (
        filters.isActive !== undefined &&
        user.isActive !== filters.isActive
      ) {
        return false;
      }

      return true;
    });
  }, [users, globalFilter, filters.role, filters.isActive]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: Math.ceil(filteredUsers.length / limit),
  });

  const handlePageChange = (newPage: number) => {
    // Client-side pagination only - no API call
    // Parent component manages the actual API data
  };

  const handlePageSizeChange = (newLimit: number) => {
    // Client-side pagination only - no API call
    // Parent component manages the actual API data
  };

  // Debounce function to prevent rapid API calls
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Client-side search only - no API calls needed
  // const debouncedSearchChange = useCallback(
  //   debounce((value: string) => {
  //     if (onFiltersChange) {
  //       onFiltersChange({ ...filters, search: value || undefined });
  //     }
  //   }, 300),
  //   [filters, onFiltersChange],
  // );

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value); // Update UI immediately for responsive typing
    // Client-side search only - no API calls needed
  };

  // Memoized filtered count for performance
  const filteredCount = useMemo(() => filteredUsers.length, [filteredUsers]);

  // Search state for UX feedback
  const isSearching = globalFilter && globalFilter.trim().length > 0;
  const hasResults = filteredCount > 0;

  const handleRoleFilterChange = (value: string) => {
    const newRole = value === 'all' ? undefined : (value as User['role']);
    // Client-side filter only - no API call
    // if (onFiltersChange) {
    //   onFiltersChange({ ...filters, role: newRole });
    // }
  };

  const handleStatusFilterChange = (value: string) => {
    const newStatus = value === 'all' ? undefined : value === 'true';
    // Client-side filter only - no API call
    // if (onFiltersChange) {
    //   onFiltersChange({ ...filters, isActive: newStatus });
    // }
  };

  const clearFilters = () => {
    setGlobalFilter('');
    // Client-side clear only - no API call
    // if (onFiltersChange) {
    //   onFiltersChange({});
    // }
  };

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
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">用戶</span>
              <Badge variant="secondary" className="text-xs">
                {filteredCount} / {total}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋用戶..."
                  value={globalFilter ?? ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-48 h-9 text-sm"
                  key="search-input" // Stable key to prevent re-renders
                />
              </div>

              {/* Role Filter */}
              <Select
                value={filters.role || 'all'}
                onValueChange={handleRoleFilterChange}
              >
                <SelectTrigger className="w-32 h-9 text-sm">
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有角色</SelectItem>
                  <SelectItem value="admin">系統管理員</SelectItem>
                  <SelectItem value="manager">維護員</SelectItem>
                  <SelectItem value="user">一般用戶</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={
                  filters.isActive === undefined
                    ? 'all'
                    : filters.isActive.toString()
                }
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-32 h-9 text-sm">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有狀態</SelectItem>
                  <SelectItem value="true">啟用</SelectItem>
                  <SelectItem value="false">停用</SelectItem>
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
                        <Users className="h-8 w-8 text-muted-foreground/50" />
                        <span>
                          {isSearching ? '搜尋中...' : '找不到符合的用戶'}
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
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                顯示 {(currentPage - 1) * limit + 1} 到{' '}
                {Math.min(currentPage * limit, filteredCount)} 共{' '}
                {filteredCount} 個結果
              </span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={pageSize.toString()}
                      className="text-xs"
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                上一頁
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum - 1)}
                      className="w-8 h-8 p-0 text-xs"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage)}
                disabled={!table.getCanNextPage()}
                className="h-8 px-3 text-xs"
              >
                下一頁
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
