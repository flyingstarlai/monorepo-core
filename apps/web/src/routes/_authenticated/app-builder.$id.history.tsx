import { createFileRoute, Link } from '@tanstack/react-router';
import {
  useDefinition,
  useBuilds,
  useDownloadArtifact,
} from '@/features/app-builder/hooks/use-app-builder';
import { LoadingOverlay } from '@/components/ui/loading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import type { MobileAppBuild } from '@/features/app-builder/types';
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/app-builder/$id/history')(
  {
    component: AppBuilderHistoryPage,
  },
);

function getStatusBadge(status: string) {
  const variants = {
    queued: 'secondary',
    building: 'default',
    completed: 'default',
    failed: 'destructive',
    cancelled: 'secondary',
  } as const;
  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {status.toUpperCase()}
    </Badge>
  );
}

function AppBuilderHistoryPage() {
  const { id } = Route.useParams();
  const {
    data: definition,
    isLoading: defLoading,
    error: defError,
  } = useDefinition(id);
  const { data: builds, isLoading: buildsLoading } = useBuilds(id);
  const downloadArtifact = useDownloadArtifact();
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (defLoading) {
    return (
      <LoadingOverlay isLoading={true} message="Loading definition...">
        <div className="h-32" />
      </LoadingOverlay>
    );
  }

  if (defError || !definition) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load definition</AlertTitle>
        <AlertDescription>
          Unable to load app definition. Please go back and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const filteredBuilds = builds?.filter(
    (b) => b.appDefinitionId === definition.id,
  );
  const canDownload = (build: MobileAppBuild) =>
    build.status === 'completed' &&
    ['admin', 'manager'].includes(user?.role || '');

  const handleDownload = async (build: MobileAppBuild) => {
    setErrorMsg(null);
    try {
      const response = await downloadArtifact.mutateAsync(build.id);
      const link = document.createElement('a');
      link.href = response.url;
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setErrorMsg('Failed to download artifact. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
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

      <h2 className="text-2xl font-semibold">
        Build History - {definition.appName}
      </h2>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {buildsLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredBuilds?.length === 0 ? (
        <div className="text-muted-foreground">
          No builds found for this app.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Build ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Build Number</TableHead>
              <TableHead>Started By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuilds?.map((build) => {
              const duration =
                build.startedAt && build.completedAt
                  ? formatDistanceToNow(new Date(build.completedAt), {
                      addSuffix: false,
                    })
                  : build.startedAt
                    ? formatDistanceToNow(new Date(build.startedAt), {
                        addSuffix: false,
                      })
                    : '-';

              const allowDownload = canDownload(build);

              return (
                <TableRow key={build.id}>
                  <TableCell className="font-mono text-sm">
                    {build.id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(build.status)}
                      {build.errorMessage && (
                        <div
                          className="text-xs text-destructive max-w-xs truncate"
                          title={build.errorMessage}
                        >
                          {build.errorMessage}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {build.startedAt
                      ? formatDistanceToNow(new Date(build.startedAt), {
                          addSuffix: true,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>{duration}</TableCell>
                  <TableCell>{build.jenkinsBuildNumber || '-'}</TableCell>
                  <TableCell>{build.startedBy}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {build.consoleUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(build.consoleUrl!, '_blank')
                          }
                        >
                          Console
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(build)}
                        disabled={!allowDownload || downloadArtifact.isPending}
                        title={
                          !allowDownload
                            ? 'Only completed builds and admin/manager can download'
                            : undefined
                        }
                      >
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
