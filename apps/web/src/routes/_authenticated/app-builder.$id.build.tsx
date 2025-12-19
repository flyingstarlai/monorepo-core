import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useDefinition,
  useTriggerBuild,
  useBuilds,
  useBuildStages,
  useBuildConsole,
} from '@/features/app-builder/hooks/use-app-builder';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingOverlay } from '@/components/ui/loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PipelineStagesTimeline } from '@/features/app-builder/components/pipeline-stages-timeline';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import type { BuildStageDetail } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const DEFAULT_PIPELINE_STAGE_NAMES = [
  'Clean Workspace',
  'Checkout',
  'Validate Parameters',
  'Setup Environment',
  'Build',
  'Archive Artifacts',
  'Upload to MinIO',
];

function normalizeStageStatuses(
  stages: BuildStageDetail[],
): BuildStageDetail[] {
  if (!stages?.length) {
    return stages;
  }

  const failedIndex = stages.findIndex((stage) => stage.status === 'failed');
  if (failedIndex === -1) {
    return stages;
  }

  return stages.map((stage, index) => {
    if (index <= failedIndex) {
      return stage;
    }

    if (stage.status === 'completed' || stage.status === 'failed') {
      return stage;
    }

    return {
      ...stage,
      status: 'skipped',
    };
  });
}

function getStatusBadgeVariant(status: string) {
  const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
    queued: 'secondary',
    building: 'default',
    completed: 'default',
    failed: 'destructive',
    cancelled: 'secondary',
  };
  return variants[status] || 'secondary';
}

export const Route = createFileRoute('/_authenticated/app-builder/$id/build')({
  component: AppBuilderBuildPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      buildId: typeof search.buildId === 'string' ? search.buildId : undefined,
    };
  },
});

function AppBuilderBuildPage() {
  const { id } = Route.useParams();
  const { buildId: urlBuildId } = Route.useSearch();
  const navigate = useNavigate();
  const { data: definition, isLoading, error } = useDefinition(id);
  const {
    data: builds,
    isLoading: buildsLoading,
    refetch: refetchBuilds,
  } = useBuilds(id);
  const triggerBuild = useTriggerBuild();
  const queryClient = useQueryClient();
  const [errorState, setErrorState] = useState<string | null>(null);
  const [infoState, setInfoState] = useState<string | null>(null);
  const lastFailedBuildIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  const monitoredBuild = useMemo(() => {
    // If a specific buildId is provided in URL, prioritize it
    if (urlBuildId && builds) {
      const specificBuild = builds.find((b) => b.id === urlBuildId);
      if (specificBuild) {
        return specificBuild;
      }
    }

    // Default behavior: prioritize active builds, then most recent
    if (!builds || builds.length === 0) {
      return undefined;
    }
    const active = builds.find((b) =>
      ['queued', 'building'].includes(b.status),
    );
    return active ?? builds[0];
  }, [builds, urlBuildId]);

  const buildInProgress = Boolean(
    monitoredBuild && ['queued', 'building'].includes(monitoredBuild.status),
  );

  const {
    data: stageProgress,
    isLoading: stagesLoading,
    isFetching: stagesFetching,
    error: stagesError,
    refetch: refetchStages,
  } = useBuildStages(monitoredBuild?.id, monitoredBuild?.status);

  const shouldFetchConsole = Boolean(
    monitoredBuild?.id && monitoredBuild.status === 'failed',
  );

  const {
    data: consoleLog,
    isFetching: consoleFetching,
    error: consoleError,
    refetch: refetchConsole,
  } = useBuildConsole(monitoredBuild?.id, shouldFetchConsole);

  const consoleErrorMessage = consoleError
    ? consoleError instanceof Error
      ? consoleError.message
      : 'Failed to load console output'
    : null;

  const stageList: BuildStageDetail[] = useMemo(() => {
    if (stageProgress?.stages?.length) {
      return normalizeStageStatuses(stageProgress.stages);
    }
    return normalizeStageStatuses(
      DEFAULT_PIPELINE_STAGE_NAMES.map((name) => ({
        name,
        status: 'pending',
      })),
    );
  }, [stageProgress]);

  const stageUpdatedLabel = stageProgress?.fetchedAt
    ? formatDistanceToNow(new Date(stageProgress.fetchedAt), {
        addSuffix: true,
      })
    : null;

  const stageSourceFallback = stageProgress?.source === 'fallback';
  const canRefreshStages = Boolean(monitoredBuild);

  useEffect(() => {
    if (!stageProgress?.stages?.length || !monitoredBuild?.id) {
      return;
    }
    const hasFailedStage = stageProgress.stages.some(
      (stage) => stage.status === 'failed',
    );
    if (hasFailedStage) {
      if (lastFailedBuildIdRef.current === monitoredBuild.id) {
        return;
      }
      lastFailedBuildIdRef.current = monitoredBuild.id;
      queryClient.invalidateQueries({ queryKey: ['app-builder', 'builds'] });
      refetchBuilds();
    } else if (lastFailedBuildIdRef.current === monitoredBuild.id) {
      lastFailedBuildIdRef.current = null;
    }
  }, [stageProgress, monitoredBuild?.id, queryClient, refetchBuilds]);

  if (import.meta.env.VITE_FEATURE_APP_BUILDER !== 'true') {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            App Builder feature is disabled. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleTrigger = async () => {
    setErrorState(null);
    setInfoState(null);

    // Check if there's an active build
    if (buildInProgress) {
      setErrorState(
        `Cannot start a new build while another build is in progress. Current build status: ${monitoredBuild?.status?.toUpperCase()}. Please wait for it to complete.`,
      );
      return;
    }

    try {
      const result = await triggerBuild.mutateAsync({ appDefinitionId: id });
      setInfoState(
        `Build ${result.buildId} queued successfully. Monitoring will update once Jenkins starts the job.`,
      );
    } catch (e: any) {
      const conflict = e?.response?.data?.conflict;
      if (conflict) {
        setErrorState(
          `Another build is already active (Build ID: ${e.response.data.activeBuildId}, Status: ${e.response.data.activeBuildStatus}). Please wait for it to complete.`,
        );
      } else {
        setErrorState('Failed to trigger build. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <LoadingOverlay isLoading={true} message="Loading definition...">
        <div className="h-32" />
      </LoadingOverlay>
    );
  }

  if (error || !definition) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load definition</AlertTitle>
        <AlertDescription>
          Unable to load app definition. Please go back and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/app-builder">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Definitions</span>
            </Button>
          </Link>
          <Link to="/app-builder/$id/history" params={{ id }}>
            <Button variant="outline" size="sm">
              View History
            </Button>
          </Link>
        </div>
        <Button
          type="button"
          disabled={triggerBuild.isPending || buildInProgress}
          onClick={handleTrigger}
        >
          {triggerBuild.isPending ? 'Triggering...' : 'Trigger Build'}
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold">
          Trigger Build for {definition.appName}
        </h2>
        <div className="text-sm space-y-1 bg-muted p-3 rounded mt-2">
          <div>
            <strong>App ID:</strong> {definition.appId}
          </div>
          <div>
            <strong>Module:</strong> {definition.appModule}
          </div>
          <div>
            <strong>Server IP:</strong> {definition.serverIp}
          </div>
        </div>
      </div>

      {errorState && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorState}</AlertDescription>
        </Alert>
      )}

      {infoState && (
        <Alert>
          <AlertTitle>Build queued</AlertTitle>
          <AlertDescription>{infoState}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Pipeline progress</p>
            <p className="text-lg font-semibold">
              {monitoredBuild
                ? `Build ${monitoredBuild.id}`
                : 'No builds queued yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {monitoredBuild && (
              <Badge variant={getStatusBadgeVariant(monitoredBuild.status)}>
                {monitoredBuild.status.toUpperCase()}
              </Badge>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canRefreshStages || stagesFetching}
              onClick={() => refetchStages()}
            >
              {stagesFetching ? 'Refreshing…' : 'Refresh stages'}
            </Button>
          </div>
        </div>

        {monitoredBuild?.status === 'failed' && (
          <div className="space-y-3 rounded-md border border-dashed p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Jenkins console output
                </p>
                <p className="text-sm font-medium">
                  Build #{monitoredBuild.jenkinsBuildNumber ?? '—'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={consoleFetching}
                onClick={() => refetchConsole()}
              >
                {consoleFetching ? 'Loading…' : 'Refresh console'}
              </Button>
            </div>
            {consoleErrorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Unable to load console</AlertTitle>
                <AlertDescription>{consoleErrorMessage}</AlertDescription>
              </Alert>
            )}
            {consoleFetching && !consoleLog && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                <div className="h-64 animate-pulse rounded bg-muted" />
              </div>
            )}
            {consoleLog && (
              <div className="max-h-[32rem] overflow-auto rounded border border-gray-200 bg-white">
                <pre className="whitespace-pre-wrap text-xs font-mono text-slate-900 p-3">
                  {consoleLog}
                </pre>
              </div>
            )}
            {!consoleFetching && !consoleLog && !consoleErrorMessage && (
              <div className="text-xs text-muted-foreground">
                Console output will appear here once Jenkins starts streaming
                logs.
              </div>
            )}
          </div>
        )}

        {monitoredBuild && (
          <dl className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Queue ID</dt>
              <dd className="font-mono">
                {monitoredBuild.jenkinsQueueId ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Build Number</dt>
              <dd className="font-mono">
                {monitoredBuild.jenkinsBuildNumber ?? '—'}
              </dd>
            </div>
          </dl>
        )}

        {stageSourceFallback && (
          <div className="text-xs text-amber-600">
            Jenkins did not return live stage data; showing default stage order.
          </div>
        )}

        {stageProgress?.message && (
          <div className="text-xs text-muted-foreground">
            {stageProgress.message}
          </div>
        )}

        {stageUpdatedLabel && (
          <div className="text-xs text-muted-foreground">
            Updated {stageUpdatedLabel}
          </div>
        )}

        {stagesError && (
          <Alert variant="destructive">
            <AlertTitle>Failed to load stages</AlertTitle>
            <AlertDescription>
              Unable to load Jenkins stage progress. Try refreshing.
            </AlertDescription>
          </Alert>
        )}

        {!monitoredBuild && buildsLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-3 animate-pulse rounded bg-muted" />
            ))}
          </div>
        )}

        {!monitoredBuild && !buildsLoading && (
          <div className="text-sm text-muted-foreground">
            Trigger a build to see Jenkins stage progress.
          </div>
        )}

        {monitoredBuild && stagesLoading && !stageProgress && (
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        )}

        {monitoredBuild && (!stagesLoading || stageProgress) && (
          <PipelineStagesTimeline stages={stageList} />
        )}
      </div>

      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
        <strong>Note:</strong> Only one build can run at a time.{' '}
        {buildInProgress
          ? 'A build is currently active, so triggering another one is disabled.'
          : 'If another build is active, this request will be rejected.'}
      </div>
    </div>
  );
}
