import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import {
  useDefinition,
  useBuild,
  useBuildStages,
  useBuildConsole,
  useDownloadArtifact,
} from '@/features/app-builder/hooks/use-app-builder';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoadingOverlay } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PipelineStagesTimeline } from '@/features/app-builder/components/pipeline-stages-timeline';
import type { BuildStageDetail } from '@/lib/types';
import {
  ArrowLeft,
  Clock,
  Download,
  ExternalLink,
  Loader2,
  RefreshCcw,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const statusVariants = {
  queued: 'secondary',
  building: 'default',
  completed: 'default',
  failed: 'destructive',
  cancelled: 'secondary',
} as const;

const formatTimestamp = (value?: string) => {
  if (!value) return 'Not recorded';
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return value;
  }
};

const formatDuration = (ms?: number) => {
  if (!ms) return '—';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

const formatRelativeTime = (value?: string) =>
  value
    ? formatDistanceToNow(new Date(value), { addSuffix: true })
    : 'Not started';

const safeJson = (value?: unknown) => {
  if (!value) return 'No data available';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch (err) {
    return 'Unable to display data';
  }
};

const readableId = (id?: string) =>
  id ? `${id.slice(0, 4)}...${id.slice(-4)}` : 'Unknown build';

export const Route = createFileRoute(
  '/_authenticated/app-builder/$id/history/$buildId',
)({
  component: AppBuilderHistoryDetailPage,
});

function AppBuilderHistoryDetailPage() {
  const { id, buildId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: definition,
    isLoading: defLoading,
    error: defError,
  } = useDefinition(id);
  const {
    data: build,
    isLoading: buildLoading,
    error: buildError,
  } = useBuild(buildId);
  const { data: stageProgress } = useBuildStages(buildId, build?.status);
  const {
    data: consoleOutput,
    isFetching: consoleFetching,
    refetch: refetchConsole,
  } = useBuildConsole(buildId, true);
  const downloadArtifact = useDownloadArtifact();
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const stageItems: BuildStageDetail[] = useMemo(() => {
    if (stageProgress?.stages?.length) {
      return stageProgress.stages;
    }
    const snapshotStages = (
      build?.stagesSnapshot as { stages?: BuildStageDetail[] } | undefined
    )?.stages;
    return snapshotStages ?? [];
  }, [stageProgress?.stages, build?.stagesSnapshot]);

  useEffect(() => {
    if (!stageItems.length) {
      setSelectedStageIndex(0);
      return;
    }
    setSelectedStageIndex((prev) => {
      if (prev < stageItems.length) return prev;
      return Math.max(stageItems.length - 1, 0);
    });
  }, [stageItems.length]);

  const selectedStage = stageItems[selectedStageIndex] ?? null;

  useEffect(() => {
    if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
    return (
      <div className="rounded-lg border border-muted bg-muted/20 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Feature disabled
            </p>
            <p className="text-sm text-muted-foreground/80 mt-1">
              App Builder feature is disabled. Please contact your
              administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (defLoading || buildLoading) {
    return (
      <LoadingOverlay isLoading message="Loading build details...">
        <div className="h-64" />
      </LoadingOverlay>
    );
  }

  if (defError || buildError || !build) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-start gap-2">
          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Unable to load build
            </p>
            <p className="text-sm text-destructive/80 mt-1">
              {buildError?.message ||
                defError?.message ||
                'Build details could not be retrieved.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allowDownload =
    build.status === 'completed' &&
    ['admin', 'manager'].includes(user?.role || '');

  const handleDownload = async () => {
    setDownloadError(null);
    try {
      const response = await downloadArtifact.mutateAsync(build.id);
      const link = document.createElement('a');
      link.href = response.url;
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setDownloadError('Failed to download artifact. Please try again.');
    }
  };

  const stats = [
    { label: 'Definition', value: definition?.appName ?? '—' },
    { label: 'App ID', value: definition?.appId ?? '—' },
    { label: 'Build Number', value: build.jenkinsBuildNumber ?? '—' },
    { label: 'Build Type', value: build.buildType ?? '—' },
    { label: 'Started By', value: build.startedBy ?? '—' },
    {
      label: 'Queue ID',
      value: build.jenkinsQueueId ? `#${build.jenkinsQueueId}` : '—',
    },
    { label: 'Started At', value: formatTimestamp(build.startedAt) },
    { label: 'Completed At', value: formatTimestamp(build.completedAt) },
    { label: 'Duration', value: formatDuration(build.durationMs) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/app-builder/$id/history" params={{ id }}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to history
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">
              {definition?.appName} • Build {build.jenkinsBuildNumber ?? 'N/A'}
            </p>
            <h1 className="text-2xl font-semibold">{readableId(build.id)}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={statusVariants[build.status] || 'secondary'}
            className="uppercase"
          >
            {build.status}
          </Badge>
          {build.consoleUrl && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(build.consoleUrl!, '_blank')}
            >
              <ExternalLink className="h-4 w-4" /> Console
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            disabled={!allowDownload || downloadArtifact.isPending}
            onClick={handleDownload}
            title={
              !allowDownload
                ? 'Only completed builds triggered by admin/manager can be downloaded'
                : undefined
            }
          >
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      {downloadError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Download failed
              </p>
              <p className="text-sm text-destructive/80 mt-1">
                {downloadError}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Build summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated {formatRelativeTime(build.updatedAt)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="space-y-1 rounded-lg border p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pipeline Stages
              {stageItems.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {stageItems.length} stages
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {stageItems.length
                ? `Snapshot from ${formatTimestamp(stageProgress?.fetchedAt)}`
                : 'Stage data not available'}
            </p>
          </CardHeader>
          <CardContent>
            {stageItems.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-muted bg-muted/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">No stages available yet</p>
                  <p className="text-sm">
                    Stage progress details will appear when Jenkins reports
                    them.
                  </p>
                </div>
              </div>
            ) : (
              <PipelineStagesTimeline
                stages={stageItems}
                selectedIndex={selectedStageIndex}
                onSelectStage={(index) => setSelectedStageIndex(index)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Stage Detail
              {selectedStage && (
                <Badge variant="outline" className="capitalize">
                  {selectedStage.status}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedStage
                ? selectedStage.name
                : 'Select a stage to inspect timing details'}
            </p>
          </CardHeader>
          <CardContent>
            {selectedStage ? (
              <div className="space-y-6">
                {/* Status Overview */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground mb-1">
                      Status
                    </p>
                    <p className="text-lg font-semibold capitalize">
                      {selectedStage.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-muted-foreground mb-1">
                      Step
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {selectedStageIndex + 1}
                    </p>
                  </div>
                </div>

                {/* Timing Details */}
                <div className="grid gap-4 text-sm">
                  <div className="space-y-2 p-3 rounded-lg border">
                    <p className="text-xs uppercase text-muted-foreground">
                      Started
                    </p>
                    <p className="font-mono">
                      {selectedStage.startTimeMillis
                        ? formatTimestamp(
                            new Date(
                              selectedStage.startTimeMillis,
                            ).toISOString(),
                          )
                        : 'Not reported'}
                    </p>
                  </div>
                  <div className="space-y-2 p-3 rounded-lg border">
                    <p className="text-xs uppercase text-muted-foreground">
                      Duration
                    </p>
                    <p className="font-mono text-lg">
                      {formatDuration(selectedStage.durationMillis)}
                    </p>
                  </div>
                  {selectedStage.pauseDurationMillis ? (
                    <div className="space-y-2 p-3 rounded-lg border border-amber-200 bg-amber-50">
                      <p className="text-xs uppercase text-muted-foreground">
                        Paused
                      </p>
                      <p className="font-mono text-lg text-amber-700">
                        {formatDuration(selectedStage.pauseDurationMillis)}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Progress Indicator for Running Stages */}
                {selectedStage.status === 'running' && (
                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                      <p className="text-sm text-blue-700">
                        Stage is currently executing...
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message for Failed Stages */}
                {selectedStage.status === 'failed' && (
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Stage failed
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Check the console output above for detailed error
                          information.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-muted bg-muted/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">No stage selected</p>
                    <p className="text-sm">
                      Click on a stage to see detailed timing information
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 h-full">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Console output</CardTitle>
              <p className="text-sm text-muted-foreground">
                Full Jenkins log for this build
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => refetchConsole()}
              disabled={consoleFetching}
            >
              {consoleFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              {consoleFetching && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              <pre className="h-80 w-full overflow-auto rounded-lg bg-muted/50 p-4 text-xs font-mono">
                {consoleOutput || 'Console output unavailable for this build'}
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Build parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="h-40 overflow-auto rounded-lg bg-muted/50 p-3 text-xs">
                {safeJson(build.buildParameters)}
              </pre>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Performance metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="h-40 overflow-auto rounded-lg bg-muted/50 p-3 text-xs">
                {safeJson(build.performanceMetrics)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
