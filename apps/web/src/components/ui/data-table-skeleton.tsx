import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export interface DataTableSkeletonProps {
  columns: number;
  rows?: number;
  showSearch?: boolean;
  showFilter?: boolean;
  showPagination?: boolean;
  columnWidths?: string[];
}

export function DataTableSkeleton({
  columns,
  rows = 5,
  showSearch = false,
  showFilter = false,
  showPagination = false,
  columnWidths,
}: DataTableSkeletonProps) {
  const widths = columnWidths || Array(columns).fill('w-24');

  return (
    <div className="space-y-4">
      {(showSearch || showFilter) && (
        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="flex-1">
              <Skeleton className="h-10 max-w-sm rounded-md" />
            </div>
          )}
          {showFilter && <Skeleton className="h-10 w-32 rounded-md" />}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className={cn('h-4', widths[i])} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton className={cn('h-4', widths[colIdx])} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-8 w-[70px]" />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="h-8 w-8 p-0" disabled>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-8 w-8 p-0" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-8 w-8 p-0" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-8 w-8 p-0" disabled>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
