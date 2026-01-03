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
  UsersRound,
} from 'lucide-react';
import type { Group } from '../types/group.types';

interface GroupDataTableProps {
  data?: Group[];
  isLoading?: boolean;
  columns: ColumnDef<Group>[];
}

export function GroupDataTable({
  data,
  isLoading,
  columns,
}: GroupDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const groups = data || [];
  const total = groups.length;

  const filteredGroups = useMemo(() => {
    if (!globalFilter && statusFilter === 'all') {
      return groups;
    }

    return groups.filter((group) => {
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase();
        const matchesName = group.name.toLowerCase().includes(searchLower);
        const matchesDescription = group.description
          ?.toLowerCase()
          .includes(searchLower);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      if (
        statusFilter !== 'all' &&
        group.isActive !== (statusFilter === 'true')
      ) {
        return false;
      }

      return true;
    });
  }, [groups, globalFilter, statusFilter]);

  const table = useReactTable({
    data: filteredGroups,
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
      pageIndex: 0,
    }));
  };

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const clearFilters = () => {
    setGlobalFilter('');
    setStatusFilter('all');
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const filteredCount = useMemo(
    () => filteredGroups.length,
    [filteredGroups, globalFilter, statusFilter],
  );

  const isSearching = globalFilter && globalFilter.trim().length > 0;

  const currentPage = paginationState.pageIndex + 1;
  const pageSize = paginationState.pageSize;
  const totalPages = Math.ceil(filteredCount / pageSize);

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
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
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
          <div className="flex flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <UsersRound className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">群組</span>
              <Badge variant="secondary" className="text-xs">
                {filteredCount} / {total}
              </Badge>
            </div>

            <div className="flex flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋群組..."
                  value={globalFilter ?? ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-48 h-9 text-sm"
                  key="search-input"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="h-9 px-3 text-sm border rounded-md bg-background"
              >
                <option value="all">所有狀態</option>
                <option value="true">啟用</option>
                <option value="false">停用</option>
              </select>

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
                        <UsersRound className="h-8 w-8 text-muted-foreground/50" />
                        <span>{isSearching ? '搜尋中...' : '找不到群組'}</span>
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
