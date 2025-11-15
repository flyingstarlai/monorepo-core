import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface FullScreenLoaderProps {
  message?: string;
  className?: string;
}

export function FullScreenLoader({
  message = 'Loading...',
  className,
}: FullScreenLoaderProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Logo/Spinner */}
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20" />
        </div>

        {/* Loading Message */}
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-foreground">{message}</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your experience
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

export default FullScreenLoader;
