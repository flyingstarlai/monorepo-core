import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  Loader2,
  MinusCircle,
  AlertTriangle,
} from 'lucide-react';
import type { PipelineStageStatus } from '@/lib/types';

interface StepperItemProps {
  step: number;
  title: string;
  status: PipelineStageStatus;
  isActive?: boolean;
  duration?: number;
  startTime?: number;
  pauseDuration?: number;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  completed: {
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
    borderColor: 'border-emerald-500',
    icon: CheckCircle2,
    label: 'Completed',
    animate: false,
  },
  running: {
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-500',
    icon: Loader2,
    label: 'Running',
    animate: true,
  },
  failed: {
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-500',
    icon: AlertTriangle,
    label: 'Failed',
    animate: false,
  },
  pending: {
    bgColor: 'bg-gray-300',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
    icon: Circle,
    label: 'Pending',
    animate: false,
  },
  skipped: {
    bgColor: 'bg-gray-200',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-200',
    icon: MinusCircle,
    label: 'Skipped',
    animate: false,
  },
} as const;

function formatDuration(ms?: number) {
  if (!ms || ms <= 0) return '—';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function formatRelativeTime(startTime?: number) {
  if (!startTime) return 'Not started';
  const now = Date.now();
  const diff = now - startTime;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function StepperItem({
  step,
  title,
  status,
  isActive = false,
  duration,
  startTime,
  pauseDuration,
  onClick,
  className,
}: StepperItemProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-4 group cursor-pointer transition-all duration-200',
        isActive && 'scale-[1.02]',
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Step Circle with Number */}
      <div className="relative z-10">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border-2 border-background shadow-lg transition-all duration-300',
            config.borderColor,
            config.bgColor,
            isActive && 'ring-4 ring-primary/20 scale-110',
            'group-hover:scale-110',
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6 transition-all duration-300',
              config.textColor,
              config.animate && 'animate-spin',
            )}
          />
          <span
            className={cn(
              'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border text-xs font-bold',
              config.borderColor,
              config.textColor,
            )}
          >
            {step}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  config.bgColor,
                  config.textColor,
                )}
              >
                {config.label}
              </span>
              {startTime && (
                <span className="text-xs text-muted-foreground">
                  Started {formatRelativeTime(startTime)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timing Information */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {duration !== undefined && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Duration: {formatDuration(duration)}
            </span>
          )}
          {pauseDuration && pauseDuration > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Paused: {formatDuration(pauseDuration)}
            </span>
          )}
        </div>

        {/* Status-specific content */}
        {status === 'running' && (
          <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 animate-pulse">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
            Stage is currently executing...
          </div>
        )}

        {status === 'failed' && (
          <div className="mt-2 text-xs text-red-600">
            Stage failed. Check error details below.
          </div>
        )}

        {status === 'skipped' && (
          <div className="mt-2 text-xs text-gray-500">
            Stage skipped due to earlier failure.
          </div>
        )}
      </div>
    </div>
  );
}

interface StepperProps {
  children: React.ReactNode;
  className?: string;
}

export function Stepper({ children, className }: StepperProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical connecting line */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
      {children}
    </div>
  );
}

interface StepperConnectorProps {
  isActive?: boolean;
  isCompleted?: boolean;
  className?: string;
}

export function StepperConnector({
  isActive = false,
  isCompleted = false,
  className,
}: StepperConnectorProps) {
  return (
    <div
      className={cn(
        'absolute left-6 top-12 w-0.5 transition-all duration-300',
        isActive && 'bg-blue-500 w-1',
        isCompleted && 'bg-emerald-500',
        !isActive && !isCompleted && 'bg-border',
        className,
      )}
    />
  );
}
