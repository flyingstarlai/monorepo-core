import { cn } from '@/lib/utils';
import type { BuildStageDetail, PipelineStageStatus } from '@/lib/types';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  MinusCircle,
} from 'lucide-react';

const STAGE_STATUS_LABELS: Record<PipelineStageStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  skipped: 'Skipped',
};

function formatStageDuration(ms?: number) {
  if (!ms || ms <= 0) {
    return '';
  }
  if (ms < 1000) {
    return `${ms} ms`;
  }
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function StageStatusIcon({ status }: { status: PipelineStageStatus }) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  }
  if (status === 'running') {
    return <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />;
  }
  if (status === 'failed') {
    return <AlertTriangle className="h-5 w-5 text-destructive" />;
  }
  if (status === 'skipped') {
    return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
  }
  return <Circle className="h-5 w-5 text-muted-foreground" />;
}

export interface PipelineStagesTimelineProps {
  stages: BuildStageDetail[];
  selectedIndex?: number;
  onSelectStage?: (index: number) => void;
  className?: string;
}

export function PipelineStagesTimeline({
  stages,
  selectedIndex,
  onSelectStage,
  className,
}: PipelineStagesTimelineProps) {
  if (!stages.length) {
    return null;
  }

  const isInteractive = typeof onSelectStage === 'function';

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line centered on icon */}
      <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-border" />

      <div className="space-y-6">
        {stages.map((stage, index) => {
          const isSelected = selectedIndex === index;

          return (
            <div
              key={stage.name || index}
              className={cn(
                'relative flex items-start gap-4 rounded-xl transition-all duration-200 group focus-visible:outline-none',
                isSelected && 'bg-blue-50 p-2',
                isInteractive &&
                  !isSelected &&
                  'cursor-pointer hover:border-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-primary/40',
              )}
              onClick={() => onSelectStage?.(index)}
              role={isInteractive ? 'button' : undefined}
              tabIndex={isInteractive ? 0 : undefined}
              onKeyDown={(event) => {
                if (!isInteractive) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectStage?.(index);
                }
              }}
            >
              {/* Stage indicator with background */}
              <div
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 transition-all duration-200',
                  isSelected ? 'border-blue-500' : 'border-border',
                )}
              >
                <StageStatusIcon status={stage.status} />
              </div>

              {/* Stage content */}
              <div className="flex-1 min-w-0 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium truncate group-hover:text-primary transition-colors">
                    {stage.name || `Stage ${index + 1}`}
                  </div>
                  <div
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full transition-colors duration-200',
                      stage.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : stage.status === 'running'
                          ? 'bg-sky-100 text-sky-700'
                          : stage.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : stage.status === 'skipped'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-gray-100 text-gray-700',
                    )}
                  >
                    {STAGE_STATUS_LABELS[stage.status]}
                  </div>
                </div>

                {stage.durationMillis && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Duration: {formatStageDuration(stage.durationMillis)}
                  </div>
                )}

                {/* Additional stage details for running/failed stages */}
                {stage.status === 'running' && (
                  <div className="text-xs text-sky-600">
                    Stage is currently executing...
                  </div>
                )}

                {stage.status === 'failed' && (
                  <div className="text-xs text-red-600">
                    Stage failed. Check error details below.
                  </div>
                )}

                {stage.status === 'skipped' && (
                  <div className="text-xs text-gray-500">
                    Stage skipped due to earlier failure.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
