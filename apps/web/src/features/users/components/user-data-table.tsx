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
  Users,
} from 'lucide-react';
import type { User } from '../types/user.types';

interface UserDataTableProps {
  data?: User[];
  isLoading?: boolean;
  columns: ColumnDef<User>[];
}

export function UserDataTable({
  data,
  isLoading,
  columns,
}: UserDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const users = data || [];
  const total = users.length;

  // Optimized search function with memoization
  const filteredUsers = useMemo(() => {
    if (!globalFilter && roleFilter === 'all' && statusFilter === 'all') {
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
      if (roleFilter && roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (
        statusFilter !== 'all' &&
        user.isActive !== (statusFilter === 'true')
      ) {
        return false;
      }

      return true;
    });
  }, [users, globalFilter, roleFilter, statusFilter]);

  const table = useReactTable({
    data: filteredUsers,
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

  // Pagination calculations
  const currentPage = paginationState.pageIndex + 1;
  const pageSize = paginationState.pageSize;
  const totalPages = Math.ceil(filteredCount / pageSize);

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
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
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
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
                value={statusFilter}
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
