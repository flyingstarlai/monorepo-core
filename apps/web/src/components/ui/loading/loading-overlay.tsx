import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { type ReactNode } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  className?: string;
  overlayClassName?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  className,
  overlayClassName,
  spinnerSize = 'md',
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-inherit',
            overlayClassName,
          )}
        >
          <div className="flex flex-col items-center space-y-2">
            <Loader2
              className={cn(
                'animate-spin text-primary',
                spinnerSizes[spinnerSize],
              )}
            />
            {message && (
              <p className="text-sm text-muted-foreground animate-pulse">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingOverlay;
