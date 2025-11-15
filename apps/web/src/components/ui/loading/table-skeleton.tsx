import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
  className?: string;
  compact?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showPagination = true,
  showFilters = true,
  className,
  compact = false,
}: TableSkeletonProps) {
  const columnWidths = compact
    ? ['w-8', 'flex-1', 'w-20', 'w-16', 'w-24', 'w-8']
    : ['w-12', 'flex-1', 'w-24', 'w-20', 'w-32', 'w-16'];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters Skeleton */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      )}

      {/* Table Skeleton */}
      <div className="rounded-lg border">
        {/* Table Header */}
        {showHeader && (
          <div className="border-b bg-muted/30 p-4">
            <div className="flex items-center space-x-4">
              {columnWidths.slice(0, columns).map((width, i) => (
                <Skeleton key={i} className={cn('h-4', width)} />
              ))}
            </div>
          </div>
        )}

        {/* Table Rows */}
        <div className="divide-y">
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4 p-4">
              {columnWidths.slice(0, columns).map((width, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={cn(
                    compact ? 'h-4' : 'h-8',
                    width,
                    colIndex === 0 && 'rounded-full',
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-20" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      )}
    </div>
  );
}

// Compact table skeleton for smaller spaces
interface CompactTableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function CompactTableSkeleton({
  rows = 3,
  columns = 3,
  className,
}: CompactTableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center space-x-4">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card grid skeleton for alternative layouts
interface CardGridSkeletonProps {
  cards?: number;
  className?: string;
}

export function CardGridSkeleton({
  cards = 6,
  className,
}: CardGridSkeletonProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {[...Array(cards)].map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
