import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Skeleton } from '../../../components/ui/skeleton';
import { useBuilds, useDownloadArtifact } from '../hooks/use-app-builder';
import type { MobileAppDefinition, MobileAppBuild } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../features/auth/hooks/use-auth';

interface BuildHistoryDialogProps {
  definition: MobileAppDefinition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function BuildHistoryDialog({
  definition,
  open,
  onOpenChange,
}: BuildHistoryDialogProps) {
  const { data: builds, isLoading } = useBuilds(definition.id);
  const downloadArtifact = useDownloadArtifact();
  const { user } = useAuth();

  const handleDownload = async (build: MobileAppBuild) => {
    if (build.status !== 'completed') {
      alert('Only completed builds can be downloaded');
      return;
    }

    if (!['admin', 'manager'].includes(user?.role || '')) {
      alert('Only admin and manager users can download artifacts');
      return;
    }

    try {
      const response = await downloadArtifact.mutateAsync(build.id);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = response.url;
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download artifact:', error);
      alert('Failed to download artifact');
    }
  };

  const filteredBuilds = builds?.filter(
    (build) => build.appDefinitionId === definition.id,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Build History - {definition.appName}</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto">
          {isLoading ? (
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
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No builds found for this app
              </p>
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
                {filteredBuilds?.map((build: MobileAppBuild) => {
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
                                window.open(build.consoleUrl, '_blank')
                              }
                            >
                              Console
                            </Button>
                          )}
                          {build.status === 'completed' &&
                            ['admin', 'manager'].includes(user?.role || '') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(build)}
                                disabled={downloadArtifact.isPending}
                              >
                                Download
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
