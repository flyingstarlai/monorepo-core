import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface FormSkeletonProps {
  fields?: number;
  showHeader?: boolean;
  showActions?: boolean;
  className?: string;
  fieldHeight?: 'sm' | 'md' | 'lg';
}

const fieldHeights = {
  sm: 'h-9',
  md: 'h-10',
  lg: 'h-11',
};

export function FormSkeleton({
  fields = 4,
  showHeader = true,
  showActions = true,
  className,
  fieldHeight = 'md',
}: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Skeleton */}
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      )}

      {/* Form Fields Skeleton */}
      <div className="space-y-4">
        {/* Two-column layout for some fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(Math.min(2, fields))].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className={cn('w-full', fieldHeights[fieldHeight])} />
            </div>
          ))}
        </div>

        {/* Single column fields */}
        {[...Array(Math.max(0, fields - 2))].map((_, i) => (
          <div key={i + 2} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className={cn('w-full', fieldHeights[fieldHeight])} />
          </div>
        ))}

        {/* Checkbox/Select field skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className={cn('w-full', fieldHeights[fieldHeight])} />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Skeleton */}
      {showActions && (
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  );
}

// Compact form skeleton for smaller spaces
interface CompactFormSkeletonProps {
  fields?: number;
  className?: string;
}

export function CompactFormSkeleton({
  fields = 3,
  className,
}: CompactFormSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export default FormSkeleton;
